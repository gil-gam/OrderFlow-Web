import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'of-order-list',
  standalone: true,
  imports: [
    RouterLink, CurrencyPipe, DatePipe, SlicePipe,
    PageHeaderComponent, LoadingStateComponent,
    EmptyStateComponent, ErrorStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly orders = signal<Order[]>([]);
  readonly state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  readonly errorMessage = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingOrder = signal<Order | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.state.set('loading');
    this.orderService.getAll().subscribe({
      next: (data) => {
        // getAll() retorna PaginatedList → usamos .items
        this.orders.set(data.items);
        this.state.set(data.items.length ? 'ready' : 'empty');
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.state.set('error');
      },
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/orders/new']);
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
      Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
    };
    return map[status] ?? 'badge-info';
  }

  confirmDelete(order: Order): void {
    this.deletingOrder.set(order);
    this.showDeleteConfirm.set(true);
  }

  deleteOrder(): void {
    const order = this.deletingOrder();
    if (!order) return;
    this.showDeleteConfirm.set(false);
    this.orderService.delete(order.id).subscribe({
      next: () => this.loadOrders(),
      error: (err) => {
        this.errorMessage.set(err.message);
        this.state.set('error');
      },
    });
  }
}
