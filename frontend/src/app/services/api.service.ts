import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Example: Get all students
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  // Example: Get student by ID
  getStudentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/students/${id}`);
  }

  // Example: Create new student
  createStudent(student: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/students`, student);
  }
}