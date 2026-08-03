import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';

// CORREÇÃO: Imports individuais obrigatórios
import { CreateOrderRequest, OrderItemRequest } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'of-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);

  loading = signal(false);
  submitting = signal(false);

  // CORREÇÃO: Tipagem explícita de signals
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  form = this.fb.group({
    customerId: [null as string | null, Validators.required],
    items: this.fb.array([], Validators.required)
  });

  get items() {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.loading.set(true);
    // CORREÇÃO: Carregamento real de dados
    this.customerService.getAll().subscribe(data => this.customers.set(data));
    this.productService.getAll().subscribe(data => {
      this.products.set(data);
      this.loading.set(false);
    });
  }

  addItem() {
    const itemGroup = this.fb.group({
      productId: [null as string | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);

    const formValue = this.form.value;
    const request: CreateOrderRequest = {
      customerId: formValue.customerId!,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      items: (formValue.items as any[]).map(item => {
        const p = this.products().find(x => x.id === item.productId)!;
        return {
          productId: item.productId,
          productName: p?.name ?? '',
          quantity: item.quantity,
          unitPrice: p?.unitPrice ?? 0,
        } as OrderItemRequest;
      })
    };

    this.orderService.create(request).subscribe({
      next: () => { /* Navegação após sucesso */ },
      error: () => this.submitting.set(false)
    });
  }
}
