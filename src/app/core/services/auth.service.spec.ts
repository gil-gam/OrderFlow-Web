import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest } from '../models/auth.model';

describe('AuthService', () => {
  let httpMock: HttpTestingController;

  const mockResponse = { token: 'mock-jwt-token', email: 'test@example.com', expiresAt: '2026-12-31T23:59:59Z' };

  afterEach(() => {
    localStorage.removeItem('orderflow_token');
  });

  describe('without token', () => {
    let service: AuthService;

    beforeEach(() => {
      localStorage.removeItem('orderflow_token');
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService]
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be created', () => expect(service).toBeTruthy());
    it('should be unauthenticated when no token exists', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    describe('login', () => {
      it('should POST to /api/Auth/login with credentials', () => {
        const creds: LoginRequest = { email: 'test@example.com', password: '123456' };
        service.login(creds).subscribe();
        const req = httpMock.expectOne('/api/Auth/login');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(creds);
        req.flush(mockResponse);
      });

      it('should propagate 401 error on invalid credentials', () => {
        service.login({ email: 'wrong@test.com', password: 'wrong' }).subscribe({
          error: err => expect(err.status).toBe(401)
        });
        httpMock.expectOne('/api/Auth/login').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      });
    });

    describe('register', () => {
      it('should POST to /api/Auth/register with user data', () => {
        const data = { email: 'new@test.com', password: '123456', confirmPassword: '123456' };
        service.register(data).subscribe();
        const req = httpMock.expectOne('/api/Auth/register');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(data);
        req.flush(mockResponse);
      });
    });
  });

  describe('with token in localStorage', () => {
    let service: AuthService;

    beforeEach(() => {
      localStorage.setItem('orderflow_token', 'existing-token');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService]
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be authenticated', () => {
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should clear token on logout', () => {
      service.logout();
      expect(localStorage.getItem('orderflow_token')).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
