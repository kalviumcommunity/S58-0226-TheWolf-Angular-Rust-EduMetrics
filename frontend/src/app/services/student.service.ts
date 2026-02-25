// frontend/src/app/services/student.service.ts
// ============================================================
// STUDENT SERVICE — Assignment 3.42
// Demonstrates Observables and RxJS for Asynchronous Data Flows:
//   • BehaviorSubject for reactive state management
//   • Observable streams for API calls
//   • RxJS operators: tap, catchError, map, debounceTime, switchMap
//   • Shared state via public Observable$
//   • Proper subscription and unsubscription patterns
//
// FIX: catchError now reads err.userMessage (set by BaseApiService)
// OR falls back to err.message. This works whether BaseApiService
// throws an enriched HttpErrorResponse or a plain Error.
// ============================================================

import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  Subject,
  combineLatest,
  of
} from 'rxjs';
import {
  tap,
  catchError,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize
} from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Student, PaginatedStudents } from '../models/student.interface';

// ──────────────────────────────────────────────────────────
// INTERFACES
// ──────────────────────────────────────────────────────────

export interface StudentFilters {
  status?: string;
  department?: string;
  min_gpa?: number;
  search?: string;
  sort_by?: string;
  order?: string;
}

export interface StudentState {
  students: Student[];
  total: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

// ──────────────────────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class StudentService extends BaseApiService {

  // API endpoint constant
  private readonly STUDENTS_ENDPOINT = '/api/students';

  // ── REACTIVE STATE with BehaviorSubject ──────────────────
  // BehaviorSubject: holds current value + emits to new subscribers

  private studentsSubject      = new BehaviorSubject<Student[]>([]);
  private totalStudentsSubject = new BehaviorSubject<number>(0);
  private loadingSubject       = new BehaviorSubject<boolean>(false);
  private errorSubject         = new BehaviorSubject<string | null>(null);
  private currentPageSubject   = new BehaviorSubject<number>(1);
  private totalPagesSubject    = new BehaviorSubject<number>(0);

  // ── PUBLIC OBSERVABLE STREAMS ────────────────────────────
  // Expose as read-only Observables (components cannot push values)

  /** Stream of student arrays — emits whenever data is fetched */
  public students$: Observable<Student[]> = this.studentsSubject.asObservable();

  /** Stream of total student count */
  public totalStudents$: Observable<number> = this.totalStudentsSubject.asObservable();

  /** Stream of loading state — true while HTTP call is in flight */
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /** Stream of error messages — null when no error */
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  /** Stream of current page number */
  public currentPage$: Observable<number> = this.currentPageSubject.asObservable();

  /** Stream of total pages */
  public totalPages$: Observable<number> = this.totalPagesSubject.asObservable();

  // ── SEARCH SUBJECT — for debounced search ────────────────
  // Subject: emits values but has no initial value
  private searchSubject = new Subject<string>();

  /**
   * Debounced search stream.
   * Use this in components with async pipe for live search.
   * debounceTime(300) — waits 300ms after user stops typing
   * distinctUntilChanged() — skips if same value emitted twice
   * switchMap — cancels previous HTTP call if new search begins
   */
  public search$ = this.searchSubject.asObservable().pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.getStudents(1, 10, { search: query })),
    catchError(err => {
      const msg = (err as any).userMessage || err.message || 'Search failed';
      this.errorSubject.next(msg);
      return of({ page: 1, limit: 10, total: 0, total_pages: 0, data: [] } as PaginatedStudents);
    })
  );

  // ── COMBINED STATE STREAM ────────────────────────────────
  /**
   * combineLatest: emits combined object whenever ANY subject emits.
   * Useful for components that need multiple state values.
   */
  public state$: Observable<StudentState> = combineLatest([
    this.students$,
    this.totalStudents$,
    this.loading$,
    this.error$,
    this.currentPage$,
    this.totalPages$
  ]).pipe(
    map(([students, total, loading, error, currentPage, totalPages]) => ({
      students,
      total,
      loading,
      error,
      currentPage,
      totalPages
    }))
  );

  // ============================================================
  // CRUD METHODS — all return Observables
  // ============================================================

  /**
   * Fetch paginated list of students with optional filters.
   * Uses tap() to update BehaviorSubjects as side effects.
   * Uses finalize() to always stop loading, even on error.
   */
  getStudents(
    page: number = 1,
    limit: number = 10,
    filters?: StudentFilters
  ): Observable<PaginatedStudents> {
    // Push loading state into the stream
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.currentPageSubject.next(page);

    const params = this.buildParams({
      page,
      limit,
      ...(filters ?? {})
    });

    return this.get<PaginatedStudents>(this.STUDENTS_ENDPOINT, params).pipe(

      // tap: side effects without modifying the stream value
      tap(response => {
        this.studentsSubject.next(response.data);
        this.totalStudentsSubject.next(response.total);
        this.totalPagesSubject.next(response.total_pages);
        console.log(`✅ Students loaded: ${response.data.length} of ${response.total}`);
      }),

      // FIX: read err.userMessage (set by BaseApiService.handleError)
      // OR fall back to err.message if it's a plain Error
      catchError(err => {
        const msg = (err as any).userMessage || err.message || 'Failed to load students';
        this.errorSubject.next(msg);
        console.error('❌ getStudents error:', err);
        throw err;
      }),

      // finalize: ALWAYS runs — both on success AND on error
      // This guarantees the spinner always stops
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Get single student by ID.
   * Returns an Observable<Student> — component subscribes to get value.
   */
  getStudentById(id: number): Observable<Student> {
    return this.get<Student>(`${this.STUDENTS_ENDPOINT}/${id}`).pipe(
      tap(student => console.log('✅ Student loaded:', student.name)),
      catchError(err => {
        console.error(`❌ getStudentById(${id}) error:`, err);
        throw err;
      })
    );
  }

  /**
   * Create a new student.
   * map() transforms the raw response before it reaches the component.
   */
  createStudent(student: Partial<Student>): Observable<any> {
    return this.post(this.STUDENTS_ENDPOINT, student).pipe(
      tap(() => console.log('✅ Student created')),
      map(response => ({
        ...(response as object),
        createdAt: new Date().toISOString()
      })),
      catchError(err => {
        console.error('❌ createStudent error:', err);
        throw err;
      })
    );
  }

  /**
   * Update an existing student.
   */
  updateStudent(id: number, updates: Partial<Student>): Observable<any> {
    return this.put(`${this.STUDENTS_ENDPOINT}/${id}`, updates).pipe(
      tap(() => console.log(`✅ Student ${id} updated`)),
      catchError(err => {
        console.error(`❌ updateStudent(${id}) error:`, err);
        throw err;
      })
    );
  }

  /**
   * Delete a student by ID.
   */
  deleteStudent(id: number): Observable<any> {
    return this.delete(`${this.STUDENTS_ENDPOINT}/${id}`).pipe(
      tap(() => {
        // Optimistic update: remove from local stream immediately
        const updated = this.studentsSubject.value.filter(s => s.id !== id);
        this.studentsSubject.next(updated);
        this.totalStudentsSubject.next(this.totalStudentsSubject.value - 1);
        console.log(`✅ Student ${id} deleted`);
      }),
      catchError(err => {
        console.error(`❌ deleteStudent(${id}) error:`, err);
        throw err;
      })
    );
  }

  // ============================================================
  // CONVENIENCE METHODS — built on top of getStudents()
  // ============================================================

  /**
   * Push a new search term into the debounced search stream.
   */
  triggerSearch(query: string): void {
    this.searchSubject.next(query);
  }

  /**
   * Search students directly (non-debounced).
   */
  searchStudents(query: string, page = 1, limit = 10): Observable<PaginatedStudents> {
    return this.getStudents(page, limit, { search: query });
  }

  /**
   * Get students filtered by department.
   */
  getStudentsByDepartment(department: string): Observable<PaginatedStudents> {
    return this.getStudents(1, 50, { department });
  }

  /**
   * Get top performing students sorted by GPA.
   */
  getHighPerformers(minGpa: number = 3.5): Observable<PaginatedStudents> {
    return this.getStudents(1, 20, {
      min_gpa: minGpa,
      sort_by: 'gpa',
      order: 'desc'
    });
  }

  // ============================================================
  // STATE HELPERS — synchronous access to current values
  // ============================================================

  /** Get current students array synchronously */
  getCurrentStudents(): Student[] {
    return this.studentsSubject.value;
  }

  /** Get current loading state synchronously */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /** Clear any current error */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /** Reset entire state to defaults */
  resetState(): void {
    this.studentsSubject.next([]);
    this.totalStudentsSubject.next(0);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
    this.currentPageSubject.next(1);
    this.totalPagesSubject.next(0);
  }
}