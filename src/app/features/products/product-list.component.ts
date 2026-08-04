import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
    RouterLink,
    CurrencyPipe,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  readonly errorMessage = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingProduct = signal<Product | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.state.set('loading');
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.state.set(data.length ? 'ready' : 'empty');
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.state.set('error');
      },
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/products/new']);
  }

  confirmDelete(p: Product): void {
    this.deletingProduct.set(p);
    this.showDeleteConfirm.set(true);
  }

  deleteProduct(): void {
    const p = this.deletingProduct();
    if (!p) return;
    this.showDeleteConfirm.set(false);
    this.productService.delete(p.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => {
        this.errorMessage.set(err.message);
        this.state.set('error');
      },
    });
  }
}
