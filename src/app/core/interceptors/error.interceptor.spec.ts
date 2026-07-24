import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: routerMock }] });
  });

  const intercept = (status: number): Observable<any> => {
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status, statusText: 'Error' }));
    return TestBed.runInInjectionContext(() => errorInterceptor(req, next));
  };

  it('should redirect to /auth/login on 401', (done) => {
    intercept(401).subscribe({
      error: () => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
        done();
      }
    });
  });

  it('should rethrow 500 without redirecting', (done) => {
    intercept(500).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle network errors (status 0) without redirecting', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const errorEvent = new ErrorEvent('Network error');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 0, error: errorEvent }));
    TestBed.runInInjectionContext(() => errorInterceptor(req, next)).subscribe({
      error: () => {
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      }
    });
  });
});
