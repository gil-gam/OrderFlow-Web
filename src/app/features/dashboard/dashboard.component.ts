import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { CategoryService } from '../../core/services/category.service';
import { Order, OrderStatus } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { Customer } from '../../core/models/customer.model';
import { Category } from '../../core/models/category.model';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';

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
  readonly recentOrders = signal<Order[]>([]);
  stats: StatCard[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.orderService.getAll().subscribe((page) => {
      const orders = page.items;
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
    orders: Order[],
    products: Product[],
    customers: Customer[],
    categories: Category[]
  ): void {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
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
