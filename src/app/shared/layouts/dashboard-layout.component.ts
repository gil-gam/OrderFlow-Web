import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../components/theme-toggle.component';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'of-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './dashboard-layout.component.html'
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
