import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'of-order-detail',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './order-detail.component.html',
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

  badgeClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
      Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
    };
    return map[status] ?? 'badge-info';
  }
}
