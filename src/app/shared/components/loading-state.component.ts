import { Component, input } from '@angular/core';

@Component({
  selector: 'of-loading-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      @if (message()) {
        <p class="mt-4 text-sm text-gray-500">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingStateComponent {
  readonly message = input<string>();
}
