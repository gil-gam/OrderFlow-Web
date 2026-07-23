import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';

@Component({
  selector: 'of-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, SlicePipe, LoadingStateComponent, ErrorStateComponent],
  template: `
    @switch (state()) {
      @case ('loading') { <of-loading-state message="Loading order details..." /> }
      @case ('error') { <of-error-state [message]="errorMessage()" (retry)="loadOrder()" /> }
      @case ('ready') {
        <div class="mb-6 flex items-center justify-between">
          <div>
            <a routerLink="/orders" class="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              &larr; Back to orders
            </a>
            <h1 class="text-2xl font-bold text-gray-900">Order #{{ order()?.id | slice:0:8 }}</h1>
          </div>
          <span [class]="badgeClass(order()!.status)">{{ order()?.status }}</span>
        </div>

        <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="card">
            <div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Customer</h2></div>
            <div class="card-body">
              <p class="font-medium text-gray-900">{{ order()?.customerName }}</p>
              <p class="mt-1 text-sm text-gray-500">ID: {{ order()?.customerId }}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Summary</h2></div>
            <div class="card-body space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total items</span>
                <span class="font-medium">{{ order()?.items?.length }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Order date</span>
                <span class="font-medium">{{ order()?.createdAt | date:'medium' }}</span>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-2 text-base">
                <span class="font-semibold text-gray-900">Total</span>
                <span class="font-bold text-gray-900">{{ order()?.totalAmount | currency:'USD' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Items</h2></div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th class="px-6 py-3 font-medium text-gray-600">Product</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Unit Price</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Quantity</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of order()?.items; track item.productId) {
                  <tr>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ item.productName }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ item.unitPrice | currency:'USD' }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ item.quantity }}</td>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ item.totalPrice | currency:'USD' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly state = signal<'loading' | 'error' | 'ready'>('loading');
  readonly errorMessage = signal('');

  ngOnInit(): void { this.loadOrder(); }

  public loadOrder(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.set('loading');
    this.orderService.getById(id).subscribe({
      next: (data) => { this.order.set(data); this.state.set('ready'); },
      error: (err) => { this.errorMessage.set(err.message); this.state.set('error'); },
    });
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
      Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
    };
    return map[status] ?? 'badge-info';
  }
}
