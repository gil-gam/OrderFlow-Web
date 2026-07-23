import { Component, input, output } from '@angular/core';

@Component({
  selector: 'of-page-header',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm text-gray-500">{{ subtitle() }}</p>
        }
      </div>
      @if (showAction()) {
        <button (click)="action.emit()" class="btn-primary">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly showAction = input(false);
  readonly actionLabel = input('Add New');
  readonly action = output<void>();
}
