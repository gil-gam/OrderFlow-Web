import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
      }

      const message = extractErrorMessage(error);
      console.error(`[HTTP Error] ${error.status}: ${message}`, error);

      return throwError(() => ({
        status: error.status,
        message,
        errors: error.error?.errors ?? null,
      }));
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) return error.error.message;
  if (error.error?.title) return error.error.title;
  if (typeof error.error === 'string') return error.error;
  if (error.status === 0) return 'Unable to reach the server. Check your connection.';
  if (error.status === 404) return 'Resource not found.';
  if (error.status === 409) return 'Conflict. The resource may already exist.';
  if (error.status >= 500) return 'Internal server error. Please try again later.';
  return 'An unexpected error occurred.';
}
