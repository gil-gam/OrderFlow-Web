import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService (integration)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  afterEach(() => {
    localStorage.removeItem('orderflow_token');
    httpMock.verify();
  });

  it('should complete full auth flow: login → store → isAuthenticated → logout', () => {
    localStorage.removeItem('orderflow_token');
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [AuthService] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    expect(service.isAuthenticated()).toBeFalse();

    // 1. LOGIN — API responds with token
    service.login({ email: 'user@test.com', password: '123456' }).subscribe(() => {
      // 2. TOKEN STORED in localStorage
      expect(localStorage.getItem('orderflow_token')).toBe('jwt-token-123');
    });
    httpMock.expectOne('/api/Auth/login').flush({
      token: 'jwt-token-123',
      email: 'user@test.com',
      expiresAt: '2027-01-01T00:00:00Z'
    });

    // 3. RECREATE SERVICE — should read token from localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [AuthService] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    expect(service.isAuthenticated()).toBeTrue();

    // 4. LOGOUT
    service.logout();
    expect(localStorage.getItem('orderflow_token')).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
