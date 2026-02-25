// frontend/src/app/interceptors/auth.interceptor.ts
// ============================================================
// AUTH INTERCEPTOR — Assignment 3.32 (Angular 17 Standalone)
//
// Angular 17 standalone apps use FUNCTIONAL interceptors,
// not class-based HttpInterceptor. This is the correct style.
//
// Automatically attaches "Authorization: Bearer <API_KEY>"
// to every outgoing request to the backend.
//
// FIX: Content-Type is NOT set on GET/DELETE requests.
// Adding Content-Type to a GET triggers a CORS preflight (OPTIONS)
// which can be rejected by the backend, silently blocking all
// data requests and leaving the loading spinner stuck forever.
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

    // Only add Content-Type for requests with a body (POST, PUT, PATCH).
    // GET and DELETE requests must NOT have Content-Type — it triggers
    // an unnecessary CORS preflight OPTIONS request which can block the
    // actual request from ever reaching the Rust backend.
    const needsContentType = ['POST', 'PUT', 'PATCH'].includes(req.method);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${API_KEY}`,
    };

    if (needsContentType) {
      headers['Content-Type'] = 'application/json';
    }

    const secured = req.clone({ setHeaders: headers });

    return next(secured).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          console.error('[AuthInterceptor] Network error — is the Rust backend running on port 8080?');
        } else if (err.status === 401) {
          console.error('[AuthInterceptor] 401 — check API_KEY matches backend .env');
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