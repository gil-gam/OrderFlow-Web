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

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
      Shipped: 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
    };
    return map[status] ?? 'badge-info';
  }
}
