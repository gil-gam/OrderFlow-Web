import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CreateProductRequest, UpdateProductRequest } from '../../core/models/product.model';

@Component({
  selector: 'of-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
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
    this.categoryService.getAll().subscribe({
      next: (cs) => this.categories.set(cs),
      error: () => this.error.set('Failed to load categories.'),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productService.getById(id).subscribe((p) => {
        this.form.patchValue({
          name: p.name,
          description: p.description,
          categoryId: p.categoryId,
          price: p.unitPrice,
          stockQuantity: p.stockQuantity ?? 0,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const request: CreateProductRequest = {
      name: raw.name,
      description: raw.description,
      categoryId: raw.categoryId,
      unitPrice: raw.price,
      currency: 'USD',
    };
    const id = this.route.snapshot.paramMap.get('id');

    const obs = id
      ? this.productService.update(id, request as UpdateProductRequest)
      : this.productService.create(request);

    obs.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
