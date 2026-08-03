import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
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
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly customerService = inject(CustomerService);
  private readonly categoryService = inject(CategoryService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly recentOrders = signal<Order[]>([]);

  stats: StatCard[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      orders: this.orderService.getAll(),
      products: this.productService.getAll(),
      customers: this.customerService.getAll(),
      categories: this.categoryService.getAll(),
    }).subscribe({
      next: ({ orders, products, customers, categories }) => {
        // getAll() de orders retorna PaginatedList; usamos .items
        this.buildDashboard(orders.items, products, customers, categories);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }

  private buildDashboard(
    orders: Order[], products: Product[],
    customers: Customer[], categories: Category[]
  ): void {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
    this.recentOrders.set(sorted.slice(0, 5));

    this.stats = [
      { label: 'Total Orders', value: orders.length, icon: '📦', color: '', route: '/orders' },
      { label: 'Products', value: products.length, icon: '🏷️', color: '', route: '/products' },
      { label: 'Customers', value: customers.length, icon: '👥', color: '', route: '/customers' },
      { label: 'Categories', value: categories.length, icon: '📁', color: '', route: '/categories' },
    ];
  }

  statusBadge(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Pending: 'badge-warning',
      Confirmed: 'badge-info',
      Processing: 'badge-info',
      Shipped: 'badge-info',
      Delivered: 'badge-success',
      Cancelled: 'badge-danger',
    };
    return map[status] ?? 'badge-info';
  }
}
