import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { CategoryService } from '../../core/services/category.service';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { Order, OrderStatus } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { Customer } from '../../core/models/customer.model';
import { Category } from '../../core/models/category.model';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'of-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, SlicePipe, LoadingStateComponent],
  template: `
    @if (loading()) {
      <of-loading-state message="Loading dashboard data..." />
    } @else {
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">Overview of your order management system.</p>
      </div>

      <div class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <a [routerLink]="stat.route" class="card group cursor-pointer transition-shadow hover:shadow-md">
            <div class="card-body">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
                  <p class="mt-1 text-3xl font-bold text-gray-900">{{ stat.value }}</p>
                </div>
                <div class="rounded-lg p-3" [style.backgroundColor]="stat.color + '15'">
                  <span class="text-2xl">{{ stat.icon }}</span>
                </div>
              </div>
            </div>
          </a>
        }
      </div>

      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Recent Orders</h2>
          <a routerLink="/orders" class="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all &rarr;
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-3 font-medium text-gray-600">ID</th>
                <th class="px-6 py-3 font-medium text-gray-600">Customer</th>
                <th class="px-6 py-3 font-medium text-gray-600">Status</th>
                <th class="px-6 py-3 font-medium text-gray-600">Total</th>
                <th class="px-6 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (order of recentOrders(); track order.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 font-mono text-xs text-gray-500">{{ order.id | slice:0:8 }}...</td>
                  <td class="px-6 py-4 font-medium text-gray-900">{{ order.customerName }}</td>
                  <td class="px-6 py-4">
                    <span [class]="statusBadge(order.status)">{{ order.status }}</span>
                  </td>
                  <td class="px-6 py-4 font-medium text-gray-900">{{ order.totalAmount | currency:'USD' }}</td>
                  <td class="px-6 py-4 text-gray-500">{{ order.createdAt | date:'mediumDate' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    No orders yet.
                    <a routerLink="/orders/new" class="font-medium text-primary-600 hover:underline">Create one</a>.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly customerService = inject(CustomerService);
  private readonly categoryService = inject(CategoryService);

  readonly loading = signal(true);
  readonly recentOrders = signal<Order[]>([]);

  stats: StatCard[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.orderService.getAll().subscribe((orders) => {
      this.productService.getAll().subscribe((products) => {
        this.customerService.getAll().subscribe((customers) => {
          this.categoryService.getAll().subscribe((categories) => {
            this.buildDashboard(orders, products, customers, categories);
            this.loading.set(false);
          });
        });
      });
    });
  }

  private buildDashboard(
    orders: Order[], products: Product[],
    customers: Customer[], categories: Category[]
  ): void {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.recentOrders.set(sorted.slice(0, 5));

    this.stats = [
      { label: 'Total Orders', value: orders.length, icon: '📦', color: '#3B82F6', route: '/orders' },
      { label: 'Products', value: products.length, icon: '🏷️', color: '#10B981', route: '/products' },
      { label: 'Customers', value: customers.length, icon: '👥', color: '#F59E0B', route: '/customers' },
      { label: 'Categories', value: categories.length, icon: '📁', color: '#8B5CF6', route: '/categories' },
    ];
  }

  statusBadge(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
      Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
    };
    return map[status] ?? 'badge-info';
  }
}
