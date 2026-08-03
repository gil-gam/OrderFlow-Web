import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

@Component({
  selector: 'of-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationErrorComponent],

  templateUrl: './category-form.component.html',
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
