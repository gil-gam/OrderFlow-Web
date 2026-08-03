import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { CustomerService } from '../../core/services/customer.service';
import { ProductService } from '../../core/services/product.service';
import { CreateOrderRequest, OrderItemRequest } from '../../core/models/order.model';
import { Customer } from '../../core/models/customer.model';
import { Product } from '../../core/models/product.model';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';

@Component({
  selector: 'of-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, ValidationErrorComponent, LoadingStateComponent],
  templateUrl: './order-form.component.html',
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
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', Validators.required],
    country: ['', Validators.required],
    items: this.fb.array<ReturnType<typeof this.createItemGroup>>([]),
  });

  get items(): FormArray {
    return this.form.controls.items;
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
    this.customerService.getAll().subscribe({
      next: (cs) => this.customers.set(cs),
      error: () => { this.loading.set(false); this.error.set('Failed to load customers.'); },
    });
    this.productService.getAll().subscribe({
      next: (ps) => { this.products.set(ps); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Failed to load products.'); },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();

    const items: OrderItemRequest[] = raw.items.map((item: any) => {
      const product = this.products().find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name ?? '',
        quantity: item.quantity,
        unitPrice: product?.unitPrice ?? 0,
        currency: product?.currency ?? 'BRL',
      };
    });

    const request: CreateOrderRequest = {
      customerId: raw.customerId,
      street: raw.street,
      city: raw.city,
      state: raw.state,
      zipCode: raw.zipCode,
      country: raw.country,
      items,
    };

    this.orderService.create(request).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
