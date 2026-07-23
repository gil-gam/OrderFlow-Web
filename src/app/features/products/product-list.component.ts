import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'of-product-list',
  standalone: true,
  imports: [
    RouterLink, CurrencyPipe, PageHeaderComponent, LoadingStateComponent,
    EmptyStateComponent, ErrorStateComponent, ConfirmDialogComponent,
  ],
  template: `
    <of-page-header title="Products" subtitle="Manage your product catalog"
                    [showAction]="true" actionLabel="New Product" (action)="navigateToNew()" />

    @switch (state()) {
      @case ('loading') { <of-loading-state message="Loading products..." /> }
      @case ('error') { <of-error-state [message]="errorMessage()" (retry)="loadProducts()" /> }
      @case ('empty') {
        <of-empty-state title="No products" description="Add your first product."
                        [showAction]="true" actionLabel="New Product" (action)="navigateToNew()" />
      }
      @case ('ready') {
        <div class="card">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th class="px-6 py-3 font-medium text-gray-600">Name</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Category</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Price</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Stock</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Status</th>
                  <th class="px-6 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (p of products(); track p.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ p.name }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ p.categoryName || '—' }}</td>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ p.price | currency:'USD' }}</td>
                    <td class="px-6 py-4">
                      <span [class]="p.stockQuantity <= 5 ? 'text-red-600 font-medium' : 'text-gray-500'">
                        {{ p.stockQuantity }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="p.isActive ? 'badge-success' : 'badge-danger'">
                        {{ p.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/products', p.id, 'edit']"
                           class="rounded p-1.5 text-gray-400 hover:text-primary-600" title="Edit">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                        <button (click)="confirmDelete(p)"
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
          <of-confirm-dialog title="Delete Product"
                            [message]="'Permanently delete ' + deletingProduct()?.name + '?'"
                            confirmLabel="Delete"
                            (confirm)="deleteProduct()"
                            (cancel)="showDeleteConfirm.set(false)" />
        }
      }
    }
  `,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  readonly errorMessage = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingProduct = signal<Product | null>(null);

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.state.set('loading');
    this.productService.getAll().subscribe({
      next: (data) => { this.products.set(data); this.state.set(data.length ? 'ready' : 'empty'); },
      error: (err) => { this.errorMessage.set(err.message); this.state.set('error'); },
    });
  }

  navigateToNew(): void { }
  confirmDelete(p: Product): void { this.deletingProduct.set(p); this.showDeleteConfirm.set(true); }

  deleteProduct(): void {
    const p = this.deletingProduct();
    if (!p) return;
    this.showDeleteConfirm.set(false);
    this.productService.delete(p.id).subscribe(() => this.loadProducts());
  }
}
