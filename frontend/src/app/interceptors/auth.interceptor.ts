// frontend/src/app/interceptors/auth.interceptor.ts
// ============================================================
// AUTH INTERCEPTOR — Assignment 3.32 (Angular 17 Standalone)
//
// Angular 17 standalone apps use FUNCTIONAL interceptors,
// not class-based HttpInterceptor. This is the correct style.
//
// Automatically attaches "Authorization: Bearer <API_KEY>"
// to every outgoing request to the backend.
// ============================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Must match API_KEY in backend/.env
const API_KEY = 'dev-secret-key-123';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {

  // Only attach header for calls to OUR backend
  if (req.url.startsWith(environment.apiBaseUrl)) {
    const secured = req.clone({
      setHeaders: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return next(secured).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          console.error('[AuthInterceptor] 401 — check API_KEY in auth.interceptor.ts');
        } else if (err.status === 403) {
          console.error('[AuthInterceptor] 403 — access denied');
        }
        return throwError(() => err);
      })
    );
  }

  // External requests pass through unchanged
  return next(req);
};