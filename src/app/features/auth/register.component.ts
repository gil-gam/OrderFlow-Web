import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'of-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationErrorComponent],
  template: `
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-gray-900">Create an account</h2>
        <p class="mt-1 text-sm text-gray-500">Register to start managing orders.</p>
      </div>

      <div class="card-body">
        @if (error()) {
          <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" autocomplete="off">
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" formControlName="email"
                   class="input-field"
                   [class.input-error]="form.get('email')?.invalid && (form.get('email')?.dirty || form.get('email')?.touched)"
                   placeholder="you@example.com" autocomplete="email" />
            <of-validation-error [control]="form.get('email')" />
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" formControlName="password"
                   class="input-field"
                   [class.input-error]="form.get('password')?.invalid && (form.get('password')?.dirty || form.get('password')?.touched)"
                   placeholder="Minimum 6 characters" autocomplete="new-password" />
            <of-validation-error [control]="form.get('password')" />
          </div>

          <div>
            <label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword"
                   class="input-field"
                   [class.input-error]="form.get('confirmPassword')?.invalid && (form.get('confirmPassword')?.dirty || form.get('confirmPassword')?.touched)"
                   placeholder="Repeat your password" autocomplete="new-password" />
            <of-validation-error [control]="form.get('confirmPassword')" />
          </div>

          <button type="submit" [disabled]="form.invalid || submitting()" class="btn-primary w-full">
            @if (submitting()) {
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Creating account...
            } @else {
              Create account
            }
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-gray-500">
          Already registered?
          <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-700">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.message || 'Registration failed. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
