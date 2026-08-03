import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'of-validation-error',
  standalone: true,
  template: `
    @if (control() && control()!.invalid && (control()!.dirty || control()!.touched)) {
      <div class="mt-1.5 text-xs text-red-600">
        @if (control()!.errors?.['required']) { <span>This field is required.</span> }
        @if (control()!.errors?.['email']) { <span>Enter a valid email address.</span> }
        @if (control()!.errors?.['minlength']; as err) { <span>Minimum {{ err.requiredLength }} characters required.</span> }
        @if (control()!.errors?.['maxlength']; as err) { <span>Maximum {{ err.requiredLength }} characters allowed.</span> }
        @if (control()!.errors?.['pattern']) { <span>Invalid format.</span> }
        @if (control()!.errors?.['min']; as err) { <span>Value must be at least {{ err.min }}.</span> }
        @if (control()!.errors?.['max']; as err) { <span>Value must be at most {{ err.max }}.</span> }
        @if (control()!.errors?.['passwordMismatch']) { <span>Passwords do not match.</span> }
        @if (control()!.errors?.['serverError']; as err) { <span>{{ err }}</span> }
      </div>
    }
  `,
})
export class ValidationErrorComponent {
  readonly control = input.required<AbstractControl | null>();
}
