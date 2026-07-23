import { Component, input, output } from '@angular/core';

@Component({
  selector: 'of-confirm-dialog',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="card mx-4 w-full max-w-md">
        <div class="card-body text-center">
          <div class="mb-4 flex justify-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full"
                 [class.bg-red-100]="variant() === 'danger'"
                 [class.bg-yellow-100]="variant() === 'warning'"
                 [class.bg-blue-100]="variant() === 'info'">
              <svg class="h-7 w-7" [class.text-red-600]="variant() === 'danger'"
                   [class.text-yellow-600]="variant() === 'warning'"
                   [class.text-blue-600]="variant() === 'info'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
          @if (message()) {
            <p class="mt-2 text-sm text-gray-500">{{ message() }}</p>
          }
          <div class="mt-6 flex justify-center gap-3">
            <button (click)="cancel.emit()" class="btn-secondary">Cancel</button>
            <button (click)="confirm.emit()"
                    [class.btn-primary]="variant() !== 'danger'"
                    [class.btn-danger]="variant() === 'danger'">
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly message = input<string>();
  readonly confirmLabel = input('Confirm');
  readonly variant = input<'danger' | 'warning' | 'info'>('danger');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
