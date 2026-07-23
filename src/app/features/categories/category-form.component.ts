import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

@Component({
  selector: 'of-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationErrorComponent],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Edit Category' : 'New Category' }}</h1>
      <p class="mt-1 text-sm text-gray-500">
        {{ isEdit() ? 'Update the category details below.' : 'Create a new category to organize products.' }}
      </p>
    </div>

    <div class="card">
      <div class="card-body">
        @if (error()) {
          <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
            <input id="name" formControlName="name" class="input-field"
                   [class.input-error]="form.get('name')?.invalid && (form.get('name')?.dirty || form.get('name')?.touched)"
                   placeholder="Category name" />
            <of-validation-error [control]="form.get('name')" />
          </div>

          <div>
            <label for="description" class="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" formControlName="description" rows="3" class="input-field"
                      placeholder="Brief description of this category"></textarea>
            <of-validation-error [control]="form.get('description')" />
          </div>

          <div class="flex items-center justify-between border-t border-gray-200 pt-5">
            <a routerLink="/categories" class="text-sm font-medium text-gray-500 hover:text-gray-700">&larr; Back</a>
            <button type="submit" [disabled]="form.invalid || submitting()" class="btn-primary">
              @if (submitting()) {
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {{ isEdit() ? 'Saving...' : 'Creating...' }}
              } @else {
                {{ isEdit() ? 'Save Changes' : 'Create Category' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEdit = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.service.getById(id).subscribe((cat) =>
        this.form.patchValue({ name: cat.name, description: cat.description })
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
      ? this.service.update(id, request)
      : this.service.create(request);

    obs.subscribe({
      next: () => this.router.navigate(['/categories']),
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
