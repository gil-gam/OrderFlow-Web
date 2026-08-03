import { Component, input, output } from '@angular/core';

@Component({
  selector: 'of-error-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">Something went wrong</h3>
      @if (message()) {
        <p class="mt-1 max-w-md text-sm text-gray-500">{{ message() }}</p>
      }
      @if (showRetry()) {
        <button (click)="retry.emit()" class="btn-secondary mt-4">Try again</button>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input<string>();
  readonly showRetry = input(true);
  readonly retry = output<void>();
}
