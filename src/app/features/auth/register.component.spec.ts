import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse = { token: 't', email: 'a@b.com', expiresAt: '2026-12-31T23:59:59Z', userId: 'u1' };

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should validate email', () => {
    const email = component.form.get('email')!;
    email.setValue('invalid');
    expect(email.errors?.['email']).toBeTruthy();
    email.setValue('valid@test.com');
    expect(email.errors).toBeNull();
  });

  it('should validate passwords match', () => {
    component.form.setValue({ name: 'John', email: 'a@b.com', password: '123456', confirmPassword: '654321' });
    expect(component.form.errors?.['passwordMismatch']).toBeTruthy();
    component.form.patchValue({ confirmPassword: '123456' });
    expect(component.form.errors?.['passwordMismatch']).toBeFalsy();
  });

  it('should call authService.register on submit', () => {
    authServiceMock.register.and.returnValue(of(mockAuthResponse));
    component.form.setValue({ name: 'John', email: 'john@test.com', password: '123456', confirmPassword: '123456' });
    component.onSubmit();
    expect(authServiceMock.register).toHaveBeenCalledWith({ name: 'John', email: 'john@test.com', password: '123456' });
  });

  it('should navigate to /dashboard on success', () => {
    authServiceMock.register.and.returnValue(of(mockAuthResponse));
    component.form.setValue({ name: 'John', email: 'john@test.com', password: '123456', confirmPassword: '123456' });
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error on failure', () => {
    authServiceMock.register.and.returnValue(throwError(() => ({ message: 'Failed' })));
    component.form.setValue({ name: 'John', email: 'john@test.com', password: '123456', confirmPassword: '123456' });
    component.onSubmit();
    expect(component.error()).toBeTruthy();
  });
});
