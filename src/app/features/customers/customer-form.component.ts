import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

@Component({
  selector: 'of-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationErrorComponent],
  templateUrl: './customer-form.component.html',
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
