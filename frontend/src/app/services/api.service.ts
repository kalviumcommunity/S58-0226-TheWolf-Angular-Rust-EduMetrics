import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // Using environment variable instead of hardcoded URL
  private baseUrl = environment.apiBaseUrl;
  private apiVersion = environment.apiVersion;
  
  constructor(private http: HttpClient) {
    // Log environment info in development only
    if (environment.enableLogging) {
      console.log(`API Service initialized`);
      console.log(`Environment: ${environment.production ? 'Production' : 'Development'}`);
      console.log(`API Base URL: ${this.baseUrl}`);
    }
  }

  // Health check using environment URL
  checkHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Get all students
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/students`);
  }

  // Get student by ID
  getStudentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/students/${id}`);
  }
}