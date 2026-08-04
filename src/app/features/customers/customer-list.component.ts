import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'of-customer-list',
  standalone: true,
  imports: [
    RouterLink, PageHeaderComponent, LoadingStateComponent,
    EmptyStateComponent, ErrorStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  private readonly service = inject(CustomerService);
  private readonly router = inject(Router);

  readonly customers = signal<Customer[]>([]);
  readonly state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  readonly errorMessage = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingCustomer = signal<Customer | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.state.set('loading');
    this.service.getAll().subscribe({
      next: (data) => { this.customers.set(data); this.state.set(data.length ? 'ready' : 'empty'); },
      error: (err) => { this.errorMessage.set(err.message); this.state.set('error'); },
    });
  }

  navigateToNew(): void { this.router.navigate(['/customers/new']); }

  confirmDelete(c: Customer): void { this.deletingCustomer.set(c); this.showDeleteConfirm.set(true); }

  deleteCustomer(): void {
    const c = this.deletingCustomer();
    if (!c) return;
    this.showDeleteConfirm.set(false);
    this.service.delete(c.id).subscribe(() => this.load());
  }
}
