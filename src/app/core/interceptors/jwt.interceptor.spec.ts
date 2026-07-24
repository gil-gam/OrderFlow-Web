import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';

describe('jwtInterceptor', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;

  const setup = (tokenValue: string | null) => {
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      token: jasmine.createSpy().and.returnValue(tokenValue)
    });
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }]
    });
  };

  const intercept = (url: string): HttpRequest<unknown> => {
    let capturedRequest!: HttpRequest<unknown>;
    const req = new HttpRequest('GET', url);
    const next: HttpHandlerFn = (request: HttpRequest<unknown>): Observable<any> => {
      capturedRequest = request;
      return of() as any;
    };
    TestBed.runInInjectionContext(() => jwtInterceptor(req, next));
    return capturedRequest;
  };

  it('should add Bearer token header when token exists', () => {
    setup('valid-token');
    const result = intercept('/api/categories');
    expect(result.headers.get('Authorization')).toBe('Bearer valid-token');
  });

  it('should NOT add Authorization header when no token', () => {
    setup(null);
    const result = intercept('/api/categories');
    expect(result.headers.has('Authorization')).toBeFalse();
  });
});
