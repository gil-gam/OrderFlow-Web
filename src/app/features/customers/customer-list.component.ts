import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  template: `
    <of-page-header title="Customers" subtitle="Manage your customer base"
                    [showAction]="true" actionLabel="New Customer" (action)="navigateToNew()" />

    @switch (state()) {
      @case ('loading') { <of-loading-state message="Loading customers..." /> }
      @case ('error') { <of-error-state [message]="errorMessage()" (retry)="load()" /> }
      @case ('empty') {
        <of-empty-state title="No customers" description="Add your first customer."
                        [showAction]="true" actionLabel="New Customer" (action)="navigateToNew()" />
      }
      @case ('ready') {
        <div class="card">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th class="px-6 py-3 font-medium text-gray-600">Name</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Email</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Phone</th>
                  <th class="px-6 py-3 font-medium text-gray-600">City</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (c of customers(); track c.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ c.name }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ c.email }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ c.phone || '—' }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ c.address?.city || '—' }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/customers', c.id, 'edit']"
                           class="rounded p-1.5 text-gray-400 hover:text-primary-600" title="Edit">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                        <button (click)="confirmDelete(c)"
                                class="rounded p-1.5 text-gray-400 hover:text-red-600" title="Delete">
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
          <of-confirm-dialog title="Delete Customer"
                            [message]="'Remove ' + deletingCustomer()?.name + ' from the system?'"
                            confirmLabel="Delete"
                            (confirm)="deleteCustomer()"
                            (cancel)="showDeleteConfirm.set(false)" />
        }
      }
    }
  `,
})
export class CustomerListComponent implements OnInit {
  private readonly service = inject(CustomerService);

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

  navigateToNew(): void { }
  confirmDelete(c: Customer): void { this.deletingCustomer.set(c); this.showDeleteConfirm.set(true); }

  deleteCustomer(): void {
    const c = this.deletingCustomer();
    if (!c) return;
    this.showDeleteConfirm.set(false);
    this.service.delete(c.id).subscribe(() => this.load());
  }
}
