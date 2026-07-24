import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  const setup = (isAuthenticated: boolean) => {
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy().and.returnValue(isAuthenticated)
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  };

  it('should allow activation when user is authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/dashboard' } as any));
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /auth/login when user is not authenticated', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/dashboard' } as any));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/auth/login'],
      { queryParams: { redirect: '/dashboard' } }
    );
  });
});
