import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

@Component({
  selector: 'of-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationErrorComponent],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Edit Customer' : 'New Customer' }}</h1>
      <p class="mt-1 text-sm text-gray-500">
        {{ isEdit() ? 'Update customer information.' : 'Add a new customer to the system.' }}
      </p>
    </div>

    <div class="card">
      <div class="card-body">
        @if (error()) {
          <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
              <input formControlName="name" class="input-field" placeholder="John Doe" />
              <of-validation-error [control]="form.get('name')" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" class="input-field" placeholder="john@example.com" />
              <of-validation-error [control]="form.get('email')" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
              <input formControlName="phone" class="input-field" placeholder="+1 (555) 123-4567" />
              <of-validation-error [control]="form.get('phone')" />
            </div>
          </div>

          <fieldset class="rounded-lg border border-gray-200 p-4">
            <legend class="text-sm font-medium text-gray-700">Address</legend>
            <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="mb-1.5 block text-sm text-gray-600">Street</label>
                <input formControlName="street" class="input-field" placeholder="123 Main St" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm text-gray-600">City</label>
                <input formControlName="city" class="input-field" placeholder="New York" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm text-gray-600">State</label>
                <input formControlName="state" class="input-field" placeholder="NY" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm text-gray-600">Zip Code</label>
                <input formControlName="zipCode" class="input-field" placeholder="10001" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm text-gray-600">Country</label>
                <input formControlName="country" class="input-field" placeholder="United States" />
              </div>
            </div>
          </fieldset>

          <div class="flex items-center justify-between border-t border-gray-200 pt-5">
            <a routerLink="/customers" class="text-sm font-medium text-gray-500 hover:text-gray-700">&larr; Back</a>
            <button type="submit" [disabled]="form.invalid || submitting()" class="btn-primary">
              @if (submitting()) {
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {{ isEdit() ? 'Saving...' : 'Creating...' }}
              } @else {
                {{ isEdit() ? 'Save Changes' : 'Create Customer' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEdit = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    street: [''],
    city: [''],
    state: [''],
    zipCode: [''],
    country: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.service.getById(id).subscribe((c) => {
        this.form.patchValue({
          name: c.name, email: c.email, phone: c.phone,
          street: c.address?.street, city: c.address?.city,
          state: c.address?.state, zipCode: c.address?.zipCode,
          country: c.address?.country,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const request = {
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      address: {
        street: raw.street,
        city: raw.city,
        state: raw.state,
        zipCode: raw.zipCode,
        country: raw.country,
      },
    };

    const id = this.route.snapshot.paramMap.get('id');
    const obs = id ? this.service.update(id, request) : this.service.create(request);

    obs.subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (err) => { this.error.set(err.message); this.submitting.set(false); },
    });
  }
}
