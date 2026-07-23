import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

@Component({
  selector: 'of-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationErrorComponent],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Edit Product' : 'New Product' }}</h1>
      <p class="mt-1 text-sm text-gray-500">
        {{ isEdit() ? 'Update the product details below.' : 'Add a new product to the catalog.' }}
      </p>
    </div>

    <div class="card">
      <div class="card-body">
        @if (error()) {
          <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Product Name</label>
              <input formControlName="name" class="input-field"
                     [class.input-error]="form.get('name')?.invalid && (form.get('name')?.dirty || form.get('name')?.touched)"
                     placeholder="Product name" />
              <of-validation-error [control]="form.get('name')" />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea formControlName="description" rows="3" class="input-field"
                        placeholder="Brief description of the product"></textarea>
              <of-validation-error [control]="form.get('description')" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
              <select formControlName="categoryId" class="input-field"
                      [class.input-error]="form.get('categoryId')?.invalid && (form.get('categoryId')?.dirty || form.get('categoryId')?.touched)">
                <option value="">Select category...</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
              <of-validation-error [control]="form.get('categoryId')" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input type="number" formControlName="stockQuantity" min="0" class="input-field"
                     [class.input-error]="form.get('stockQuantity')?.invalid && (form.get('stockQuantity')?.dirty || form.get('stockQuantity')?.touched)"
                     placeholder="0" />
              <of-validation-error [control]="form.get('stockQuantity')" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Price (USD)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" formControlName="price" min="0.01" step="0.01"
                       class="input-field pl-7"
                       [class.input-error]="form.get('price')?.invalid && (form.get('price')?.dirty || form.get('price')?.touched)"
                       placeholder="0.00" />
              </div>
              <of-validation-error [control]="form.get('price')" />
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-gray-200 pt-5">
            <a routerLink="/products" class="text-sm font-medium text-gray-500 hover:text-gray-700">&larr; Back to products</a>
            <button type="submit" [disabled]="form.invalid || submitting()" class="btn-primary">
              @if (submitting()) {
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {{ isEdit() ? 'Saving...' : 'Creating...' }}
              } @else {
                {{ isEdit() ? 'Save Changes' : 'Create Product' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly isEdit = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
    categoryId: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => this.categories.set(cats));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productService.getById(id).subscribe((p) =>
        this.form.patchValue({
          name: p.name, description: p.description, categoryId: p.categoryId,
          price: p.price, stockQuantity: p.stockQuantity,
        })
      );
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    const request = this.form.getRawValue();
    const id = this.route.snapshot.paramMap.get('id');

    const obs = id
      ? this.productService.update(id, request)
      : this.productService.create(request);

    obs.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
