import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse = { token: 't', email: 'a@b.com', expiresAt: '2026-12-31T23:59:59Z', userId: 'u1' };

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
  it('should be invalid when empty', () => expect(component.form.valid).toBeFalse());

  it('should validate email format', () => {
    const email = component.form.get('email')!;
    email.setValue('invalid');
    expect(email.errors?.['email']).toBeTruthy();
    email.setValue('valid@email.com');
    expect(email.errors).toBeNull();
  });

  it('should require password with minlength 6', () => {
    const pwd = component.form.get('password')!;
    expect(pwd.errors?.['required']).toBeTruthy();
    pwd.setValue('123');
    expect(pwd.errors?.['minlength']).toBeTruthy();
    pwd.setValue('123456');
    expect(pwd.errors).toBeNull();
  });

  it('should call authService.login on submit', () => {
    authServiceMock.login.and.returnValue(of(mockAuthResponse));
    component.form.setValue({ email: 'a@b.com', password: '123456', remember: false });
    component.onSubmit();
    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'a@b.com', password: '123456' });
  });

  it('should navigate to /dashboard on success', () => {
    authServiceMock.login.and.returnValue(of(mockAuthResponse));
    component.form.setValue({ email: 'a@b.com', password: '123456', remember: false });
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error signal on failure', () => {
    authServiceMock.login.and.returnValue(throwError(() => ({ message: 'Invalid' })));
    component.form.setValue({ email: 'a@b.com', password: '123456', remember: false });
    component.onSubmit();
    expect(component.error()).toBeTruthy();
    expect(component.submitting()).toBeFalse();
  });
});
