import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = req.url.includes('/api/Auth/');

      if (error.status === 401 && !isAuthRequest) {
        auth.logout();
      }

      const message = extractErrorMessage(error);

      return throwError(() => ({
        status: error.status,
        message,
        errors: error.error?.errors ?? null,
      }));
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Unable to reach the server. Check your connection.';
  if (error.status === 400) return error.error?.title ?? 'Invalid request.';
  if (error.status === 401) return 'Invalid credentials.';
  if (error.status === 404) return 'Resource not found.';
  if (error.status === 409) return 'Conflict. The resource may already exist.';
  if (error.status >= 500) return 'Server error. Please try again later.';
  return error.error?.title ?? error.message ?? 'Unexpected error.';
}
