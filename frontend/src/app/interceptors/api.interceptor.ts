// frontend/src/app/interceptors/api.interceptor.ts
// ============================================================
// API INTERCEPTOR — Assignment 3.42
// Demonstrates intercepting the HTTP Observable stream:
//   • All HTTP calls pass through this interceptor
//   • tap() for logging without modifying the stream
//   • catchError() to handle errors globally
//   • finalize() to run cleanup after every request
// ============================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {

  // Clone request and add standard headers
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  const startTime = Date.now();
  console.log(`📤 [${modifiedReq.method}] ${modifiedReq.url}`);

  // next(req) returns an Observable of the HTTP response.
  // We pipe operators onto it to intercept and transform the stream.
  return next(modifiedReq).pipe(

    // tap: observe values in the stream without changing them
    tap(event => {
      console.log(`📥 Response received for ${modifiedReq.url}`);
    }),

    // catchError: intercept errors in the Observable stream globally
    catchError((error: HttpErrorResponse) => {
      const elapsed = Date.now() - startTime;
      console.error(`❌ HTTP Error after ${elapsed}ms:`, error.status, modifiedReq.url);

      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        errorMessage = error.error?.message
          || `Server Error (${error.status}): ${error.message}`;
      }

      // throwError returns an Observable that errors immediately
      return throwError(() => new Error(errorMessage));
    }),

    // finalize: always runs after Observable completes OR errors
    finalize(() => {
      const elapsed = Date.now() - startTime;
      console.log(`⏱️ [${modifiedReq.method}] ${modifiedReq.url} — ${elapsed}ms`);
    })
  );
};