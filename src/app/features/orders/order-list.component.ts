import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  template: `
    <of-page-header title="Orders" subtitle="Manage all orders in the system"
                    [showAction]="true" actionLabel="New Order" (action)="navigateToNew()" />

    @switch (state()) {
      @case ('loading') {
        <of-loading-state message="Loading orders..." />
      }
      @case ('error') {
        <of-error-state [message]="errorMessage()" (retry)="loadOrders()" />
      }
      @case ('empty') {
        <of-empty-state title="No orders yet"
                        description="Create your first order to get started."
                        [showAction]="true" actionLabel="New Order"
                        (action)="navigateToNew()" />
      }
      @case ('ready') {
        <div class="card">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th class="px-6 py-3 font-medium text-gray-600">ID</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Customer</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Items</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Total</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Status</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Date</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">{{ order.id | slice:0:8 }}...</td>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ order.customerName }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ order.items.length }} item(s)</td>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ order.totalAmount | currency:'USD' }}</td>
                    <td class="px-6 py-4"><span [class]="badgeClass(order.status)">{{ order.status }}</span></td>
                    <td class="px-6 py-4 text-gray-500">{{ order.createdAt | date:'mediumDate' }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/orders', order.id]"
                           class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                           title="View details">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <button (click)="confirmDelete(order)"
                                class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                title="Cancel order">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (showDeleteConfirm()) {
          <of-confirm-dialog title="Cancel Order"
                            [message]="'Are you sure you want to cancel this order?'"
                            confirmLabel="Cancel Order"
                            (confirm)="deleteOrder()"
                            (cancel)="showDeleteConfirm.set(false)" />
        }
      }
    }
  `,
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  readonly errorMessage = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingOrder = signal<Order | null>(null);

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.state.set('loading');
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.state.set(data.length === 0 ? 'empty' : 'ready');
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.state.set('error');
      },
    });
  }

  navigateToNew(): void { }

  badgeClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
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
    this.orderService.delete(order.id).subscribe(() => this.loadOrders());
  }
}
