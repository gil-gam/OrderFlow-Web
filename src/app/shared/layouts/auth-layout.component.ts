import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'of-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-primary-700">OrderFlow</h1>
          <p class="mt-2 text-sm text-gray-500">Order management system</p>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent { }
