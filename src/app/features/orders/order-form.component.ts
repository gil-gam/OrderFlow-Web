import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { CreateOrderRequest, OrderItemRequest } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { Customer } from '../../core/models/customer.model';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';

@Component({
  selector: 'of-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    ValidationErrorComponent,
    LoadingStateComponent,
  ],
  templateUrl: './order-form.component.html',
})
export class OrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);

  readonly form = this.fb.group({
    customerId: [null as string | null, Validators.required],
    items: this.fb.array([], Validators.required),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);
    this.customerService.getAll().subscribe({
      next: (data) => this.customers.set(data),
      error: (err) => { this.error.set(err.message); this.loading.set(false); },
    });
    this.productService.getAll().subscribe({
      next: (data) => { this.products.set(data.filter((p) => p.isActive)); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        productId: [null as string | null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const customer = this.customers().find((c) => c.id === formValue.customerId);

    const request: CreateOrderRequest = {
      customerId: formValue.customerId!,
      street: customer?.address?.street ?? '',
      city: customer?.address?.city ?? '',
      state: customer?.address?.state ?? '',
      zipCode: customer?.address?.zipCode ?? '',
      country: customer?.address?.country ?? '',
      items: (formValue.items as any[]).map((item): OrderItemRequest => {
        const product = this.products().find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          productName: product?.name ?? '',
          unitPrice: product?.unitPrice ?? 0,
        };
      }),
    };

    this.orderService.create(request).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
