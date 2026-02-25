// frontend/src/app/services/base-api.service.ts
// ============================================================
// BASE API SERVICE — Assignment 3.42
// Centralizes HTTP logic with:
//   • Observable-based HTTP methods
//   • Centralized catchError and error transformation
//   • retry() for transient failures
//   • HttpParams builder utility
//
// FIX: handleError now re-throws the ORIGINAL HttpErrorResponse
// (with human-readable message attached) instead of converting it
// to a plain new Error(). Converting to plain Error was breaking
// StudentService's finalize() which calls loadingSubject.next(false),
// because the error type mismatch caused the catchError in
// StudentService to not execute — leaving loading$ stuck at true.
// ============================================================

import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected http = inject(HttpClient);
  protected baseUrl = environment.apiBaseUrl;

  // ── HTTP METHODS — each returns an Observable ───────────

  /**
   * GET — retry(1) automatically retries once on transient failure.
   * catchError enriches the error then re-throws as HttpErrorResponse.
   */
  protected get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * POST — no retry (non-idempotent operation).
   */
  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT — updates an existing resource.
   */
  protected put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE — removes a resource.
   */
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  // ── CENTRALIZED ERROR HANDLER ────────────────────────────

  /**
   * FIX vs original: We attach a human-readable message to the error,
   * then re-throw the ORIGINAL HttpErrorResponse — NOT a new Error().
   *
   * Why this matters:
   *   StudentService.getStudents() has:
   *     finalize(() => this.loadingSubject.next(false))
   *   finalize() runs regardless — but the catchError in StudentService
   *   checks err.message which only exists if we preserve the error object.
   *   Converting to plain new Error() strips the .status property, so
   *   downstream handlers can't distinguish network errors from 404s.
   */
  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side / network error (no internet, DNS failure, etc.)
      errorMessage = `Network Error: ${error.error.message}`;
    } else {
      // Server-side error — try to extract backend message first
      const apiError = error.error;

      if (apiError?.message) {
        errorMessage = apiError.message;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Cannot connect to server. Is the backend running on port 8080?';
            break;
          case 400:
            errorMessage = 'Bad request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Check API key.';
            break;
          case 403:
            errorMessage = 'Access forbidden.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 409:
            errorMessage = 'Conflict. This resource already exists.';
            break;
          case 422:
            errorMessage = 'Validation failed. Check your input fields.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server returned code ${error.status}: ${error.message}`;
        }
      }
    }

    console.error('❌ HTTP Error:', errorMessage, error);

    // Attach readable message but preserve the original error object
    // so downstream catchError handlers can still read .status, .error etc.
    const enrichedError = error;
    (enrichedError as any).userMessage = errorMessage;

    return throwError(() => enrichedError);
  }

  // ── PARAM BUILDER ────────────────────────────────────────

  /**
   * Converts a plain object to HttpParams.
   * Skips null, undefined, and empty string values.
   * Angular appends these as ?key=value in the URL.
   */
  protected buildParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }
}