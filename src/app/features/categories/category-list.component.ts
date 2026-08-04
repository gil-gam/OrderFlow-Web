import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'of-category-list',
  standalone: true,
  imports: [
    RouterLink, PageHeaderComponent, LoadingStateComponent,
    EmptyStateComponent, ErrorStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private readonly service = inject(CategoryService);
  private readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly state = signal<'loading' | 'error' | 'empty' | 'ready'>('loading');
  readonly errorMessage = signal('');
  readonly showDeleteConfirm = signal(false);
  readonly deletingCategory = signal<Category | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.state.set('loading');
    this.service.getAll().subscribe({
      next: (data) => { this.categories.set(data); this.state.set(data.length ? 'ready' : 'empty'); },
      error: (err) => { this.errorMessage.set(err.message); this.state.set('error'); },
    });
  }

  navigateToNew(): void { this.router.navigate(['/categories/new']); }

  confirmDelete(c: Category): void { this.deletingCategory.set(c); this.showDeleteConfirm.set(true); }

  deleteCategory(): void {
    const c = this.deletingCategory();
    if (!c) return;
    this.showDeleteConfirm.set(false);
    this.service.delete(c.id).subscribe(() => this.load());
  }
}
