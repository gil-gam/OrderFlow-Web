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
