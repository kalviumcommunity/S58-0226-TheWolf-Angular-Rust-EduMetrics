import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { Student, PaginatedStudents } from '../models/student.interface';
import { environment } from '../../environments/environment';

export interface ApiError {
  success: boolean;
  error_code: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiBaseUrl}/api/students`;
  
  // Reactive state management
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  public students$ = this.studentsSubject.asObservable();
  
  private totalStudentsSubject = new BehaviorSubject<number>(0);
  public totalStudents$ = this.totalStudentsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🔧 StudentService initialized with API URL:', this.apiUrl);
  }

  /**
   * GET - Fetch students with pagination and filtering
   */
  getStudents(page: number = 1, limit: number = 10, filters?: any): Observable<PaginatedStudents> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.min_gpa) params = params.set('min_gpa', filters.min_gpa.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.order) params = params.set('order', filters.order);
    }

    console.log('📡 Fetching students with params:', params.toString());

    return this.http.get<PaginatedStudents>(this.apiUrl, { params }).pipe(
      retry(1), // Retry once on failure
      tap(response => {
        console.log('✅ Students fetched successfully:', response.total, 'total');
        this.studentsSubject.next(response.data);
        this.totalStudentsSubject.next(response.total);
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * GET - Fetch single student by ID
   */
  getStudentById(id: number): Observable<Student> {
    console.log('📡 Fetching student ID:', id);
    
    return this.http.get<Student>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      tap(student => console.log('✅ Student fetched:', student.name)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * POST - Create new student
   */
  createStudent(student: Partial<Student>): Observable<any> {
    console.log('📡 Creating student:', student.name);
    
    return this.http.post(this.apiUrl, student).pipe(
      tap(response => console.log('✅ Student created:', response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PUT - Update student
   */
  updateStudent(id: number, updates: Partial<Student>): Observable<any> {
    console.log('📡 Updating student ID:', id, updates);
    
    return this.http.put(`${this.apiUrl}/${id}`, updates).pipe(
      tap(response => console.log('✅ Student updated:', response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * DELETE - Remove student
   */
  deleteStudent(id: number): Observable<any> {
    console.log('📡 Deleting student ID:', id);
    
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('✅ Student deleted:', response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse) {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      const apiError = error.error as ApiError;
      
      if (apiError && apiError.message) {
        errorMessage = `${apiError.error_code || 'ERROR'}: ${apiError.message}`;
      } else {
        errorMessage = `HTTP ${error.status}: ${error.message}`;
      }
    }
    
    console.error('❌ API Error:', errorMessage, error);
    this.errorSubject.next(errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}