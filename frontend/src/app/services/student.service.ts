import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Student, PaginatedStudents } from '../models/student.interface';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  /**
   * Get all students with pagination and filtering
   */
  getStudents(page: number = 1, limit: number = 10, filters?: any): Observable<PaginatedStudents> {
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

    return this.http.get<PaginatedStudents>(this.apiUrl, { params }).pipe(
      tap(response => {
        this.studentsSubject.next(response.data);
        this.totalStudentsSubject.next(response.total);
      })
    );
  }

  /**
   * Get single student by ID
   */
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new student
   */
  createStudent(student: Partial<Student>): Observable<any> {
    return this.http.post(this.apiUrl, student);
  }

  /**
   * Update student
   */
  updateStudent(id: number, updates: Partial<Student>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete student
   */
  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}