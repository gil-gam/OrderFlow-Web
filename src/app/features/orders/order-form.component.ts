import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { CustomerService } from '../../core/services/customer.service';
import { ProductService } from '../../core/services/product.service';
import { Customer } from '../../core/models/customer.model';
import { Product } from '../../core/models/product.model';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';

@Component({
  selector: 'of-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, ValidationErrorComponent, LoadingStateComponent],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">New Order</h1>
      <p class="mt-1 text-sm text-gray-500">Create a new order for a customer.</p>
    </div>

    @if (loading()) {
      <of-loading-state message="Loading customers and products..." />
    } @else {
      <div class="card">
        <div class="card-body">
          @if (error()) {
            <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="customer" class="mb-1.5 block text-sm font-medium text-gray-700">Customer</label>
              <select id="customer" formControlName="customerId"
                      class="input-field"
                      [class.input-error]="form.get('customerId')?.invalid && (form.get('customerId')?.dirty || form.get('customerId')?.touched)">
                <option value="">Select a customer...</option>
                @for (c of customers(); track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ c.email }})</option>
                }
              </select>
              <of-validation-error [control]="form.get('customerId')" />
            </div>

            <div>
              <div class="mb-3 flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700">Items</label>
                <button type="button" (click)="addItem()" class="btn-secondary btn-sm">+ Add item</button>
              </div>

              <div formArrayName="items" class="space-y-3">
                @for (item of items.controls; track item; let i = $index) {
                  <div [formGroupName]="i" class="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div class="flex-1">
                      <select formControlName="productId"
                              class="input-field text-sm"
                              [class.input-error]="item.get('productId')?.invalid && item.get('productId')?.touched">
                        <option value="">Select product</option>
                        @for (p of products(); track p.id) {
                          <option [value]="p.id">{{ p.name }} — {{ p.price | currency:'USD' }}</option>
                        }
                      </select>
                    </div>
                    <div class="w-24">
                      <input type="number" formControlName="quantity" min="1"
                             class="input-field text-sm text-center" placeholder="Qty" />
                    </div>
                    <button type="button" (click)="removeItem(i)"
                            class="mt-1.5 rounded p-1 text-gray-400 hover:text-red-600">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                }
              </div>

              @if (items.length === 0) {
                <p class="text-sm text-gray-400 italic">No items added yet. Click "+ Add item" above.</p>
              }
            </div>

            <div class="flex items-center justify-between border-t border-gray-200 pt-5">
              <a routerLink="/orders" class="text-sm font-medium text-gray-500 hover:text-gray-700">&larr; Back to orders</a>
              <button type="submit" [disabled]="form.invalid || submitting()" class="btn-primary">
                @if (submitting()) {
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating...
                } @else {
                  Create Order
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class OrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    items: this.fb.array<ReturnType<typeof this.createItemGroup>>([]),
  });

  get items() {
    return this.form.controls.items as FormArray;
  }

  private createItemGroup() {
    return this.fb.nonNullable.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  ngOnInit(): void {
    this.customerService.getAll().subscribe((cs) => this.customers.set(cs));
    this.productService.getAll().subscribe((ps) => {
      this.products.set(ps.filter((p) => p.isActive));
      this.loading.set(false);
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.orderService.create(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => {
        this.error.set(err.message);
        this.submitting.set(false);
      },
    });
  }
}
