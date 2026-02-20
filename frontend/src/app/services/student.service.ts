// frontend/src/app/services/student.service.ts
// ============================================================
// STUDENT SERVICE — Assignment 3.27
// Parses the structured { success, error_code, message } error
// bodies returned by the Rust backend and surfaces them cleanly
// to Angular components.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentListResponse,
  StudentResponse,
  ApiError,
} from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly apiUrl = 'http://localhost:8080/api/students';

  constructor(private http: HttpClient) {}

  // ──────────────────────────────────────────────────────────
  // GET ALL STUDENTS
  // ──────────────────────────────────────────────────────────
  getAllStudents(): Observable<StudentListResponse> {
    return this.http.get<StudentListResponse>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // ──────────────────────────────────────────────────────────
  // GET STUDENT BY ID
  // ──────────────────────────────────────────────────────────
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ──────────────────────────────────────────────────────────
  // CREATE STUDENT
  // ──────────────────────────────────────────────────────────
  createStudent(data: CreateStudentRequest): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  // ──────────────────────────────────────────────────────────
  // UPDATE STUDENT
  // ──────────────────────────────────────────────────────────
  updateStudent(id: number, data: UpdateStudentRequest): Observable<{ success: boolean; message: string; id: number }> {
    return this.http
      .put<{ success: boolean; message: string; id: number }>(
        `${this.apiUrl}/${id}`,
        data
      )
      .pipe(catchError(this.handleError));
  }

  // ──────────────────────────────────────────────────────────
  // DELETE STUDENT
  // ──────────────────────────────────────────────────────────
  deleteStudent(id: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ──────────────────────────────────────────────────────────
  // CENTRAL ERROR HANDLER
  // ──────────────────────────────────────────────────────────
  // The Rust backend always returns a structured JSON body:
  //   { success: false, error_code: "NOT_FOUND", message: "..." }
  //
  // We extract that and throw an ApiError so components can
  // display meaningful messages without brittle status-code checks.
  // ──────────────────────────────────────────────────────────
  private handleError(response: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (response.error && typeof response.error === 'object' && 'error_code' in response.error) {
      // Structured error from our Rust backend
      apiError = {
        statusCode: response.status,
        errorCode: response.error.error_code,
        message: response.error.message,
      };
    } else if (response.status === 0) {
      // Network failure — backend is unreachable
      apiError = {
        statusCode: 0,
        errorCode: 'NETWORK_ERROR',
        message: 'Cannot reach the server. Please check your connection.',
      };
    } else if (response.status === 422) {
      // Actix-level body parse failure (malformed JSON)
      apiError = {
        statusCode: 422,
        errorCode: 'UNPROCESSABLE_ENTITY',
        message: 'The request body could not be parsed.',
      };
    } else {
      // Fallback for unexpected responses
      apiError = {
        statusCode: response.status,
        errorCode: 'UNKNOWN_ERROR',
        message: response.message || 'An unexpected error occurred.',
      };
    }

    console.error('[StudentService] API error:', apiError);
    return throwError(() => apiError);
  }
}