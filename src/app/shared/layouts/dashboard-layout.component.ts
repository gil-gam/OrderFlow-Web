import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'of-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen">
      <aside class="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div class="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <span class="text-xl font-bold text-primary-700">OrderFlow</span>
          <span class="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">WEB</span>
        </div>

        <nav class="flex-1 space-y-1 px-3 py-4">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="bg-primary-50 text-primary-700 font-medium"
               class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100">
              <span class="text-lg">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="border-t border-gray-200 p-4">
          <button (click)="logout()"
                  class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-auto">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Orders', path: '/orders', icon: '📦' },
    { label: 'Products', path: '/products', icon: '🏷️' },
    { label: 'Categories', path: '/categories', icon: '📁' },
    { label: 'Customers', path: '/customers', icon: '👥' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
