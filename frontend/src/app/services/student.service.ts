import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Student, PaginatedStudents } from '../models/student.interface';

/**
 * Student API Service - handles all student-related API calls
 * Extends BaseApiService for common HTTP methods and error handling
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService extends BaseApiService {
  // API endpoints
  private readonly STUDENTS_ENDPOINT = '/api/students';

  // Reactive state management
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  public students$ = this.studentsSubject.asObservable();

  private totalStudentsSubject = new BehaviorSubject<number>(0);
  public totalStudents$ = this.totalStudentsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  /**
   * Fetch students with pagination and filtering
   */
  getStudents(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      department?: string;
      min_gpa?: number;
      search?: string;
      sort_by?: string;
      order?: string;
    }
  ): Observable<PaginatedStudents> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const params = this.buildParams({
      page,
      limit,
      ...filters
    });

    return this.get<PaginatedStudents>(this.STUDENTS_ENDPOINT, params).pipe(
      tap(response => {
        this.studentsSubject.next(response.data);
        this.totalStudentsSubject.next(response.total);
        this.loadingSubject.next(false);
        console.log('✅ Students loaded:', response.total);
      }),
      tap({
        error: (err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err.message);
        }
      })
    );
  }

  /**
   * Get single student by ID
   */
  getStudentById(id: number): Observable<Student> {
    return this.get<Student>(`${this.STUDENTS_ENDPOINT}/${id}`);
  }

  /**
   * Create new student
   */
  createStudent(student: Partial<Student>): Observable<any> {
    return this.post(this.STUDENTS_ENDPOINT, student).pipe(
      tap(() => console.log('✅ Student created'))
    );
  }

  /**
   * Update existing student
   */
  updateStudent(id: number, updates: Partial<Student>): Observable<any> {
    return this.put(`${this.STUDENTS_ENDPOINT}/${id}`, updates).pipe(
      tap(() => console.log('✅ Student updated'))
    );
  }

  /**
   * Delete student
   */
  deleteStudent(id: number): Observable<any> {
    return this.delete(`${this.STUDENTS_ENDPOINT}/${id}`).pipe(
      tap(() => console.log('✅ Student deleted'))
    );
  }

  /**
   * Search students by name or email
   */
  searchStudents(query: string): Observable<PaginatedStudents> {
    return this.getStudents(1, 20, { search: query });
  }

  /**
   * Get students by department
   */
  getStudentsByDepartment(department: string): Observable<PaginatedStudents> {
    return this.getStudents(1, 50, { department });
  }

  /**
   * Get high-performing students
   */
  getHighPerformers(minGpa: number = 3.5): Observable<PaginatedStudents> {
    return this.getStudents(1, 20, { 
      min_gpa: minGpa,
      sort_by: 'gpa',
      order: 'desc'
    });
  }
}