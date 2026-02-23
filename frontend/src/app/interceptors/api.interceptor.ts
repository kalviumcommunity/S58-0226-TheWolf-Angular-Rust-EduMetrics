import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request and add headers
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add auth token if available
      // 'Authorization': `Bearer ${token}`
    }
  });

  console.log('📤 HTTP Request:', modifiedReq.method, modifiedReq.url);

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ HTTP Error:', error);
      
      let errorMessage = 'An error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Server Error (${error.status}): ${error.error?.message || error.message}`;
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
};