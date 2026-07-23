import { type Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },

  {
    path: 'auth',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./shared/layouts/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register.component').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./features/orders/order-form.component').then((m) => m.OrderFormComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/order-detail.component').then((m) => m.OrderDetailComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list.component').then((m) => m.CategoryListComponent),
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./features/categories/category-form.component').then((m) => m.CategoryFormComponent),
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./features/categories/category-form.component').then((m) => m.CategoryFormComponent),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list.component').then((m) => m.CustomerListComponent),
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./features/customers/customer-form.component').then((m) => m.CustomerFormComponent),
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./features/customers/customer-form.component').then((m) => m.CustomerFormComponent),
      },
    ],
  },

  { path: '**', redirectTo: '/dashboard' },
];
