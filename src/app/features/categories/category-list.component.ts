import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  template: `
    <of-page-header title="Categories" subtitle="Organize products by categories"
                    [showAction]="true" actionLabel="New Category" (action)="navigateToNew()" />

    @switch (state()) {
      @case ('loading') { <of-loading-state message="Loading categories..." /> }
      @case ('error') { <of-error-state [message]="errorMessage()" (retry)="load()" /> }
      @case ('empty') {
        <of-empty-state title="No categories" description="Create your first category to organize products."
                        [showAction]="true" actionLabel="New Category" (action)="navigateToNew()" />
      }
      @case ('ready') {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (cat of categories(); track cat.id) {
            <div class="card group relative">
              <div class="card-body">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ cat.name }}</h3>
                    @if (cat.description) {
                      <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ cat.description }}</p>
                    }
                  </div>
                  <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <a [routerLink]="['/categories', cat.id, 'edit']"
                       class="rounded p-1.5 text-gray-400 hover:text-primary-600">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                    <button (click)="confirmDelete(cat)"
                            class="rounded p-1.5 text-gray-400 hover:text-red-600">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        @if (showDeleteConfirm()) {
          <of-confirm-dialog title="Delete Category"
                            [message]="'Are you sure you want to delete ' + deletingCategory()?.name + '?'"
                            confirmLabel="Delete"
                            (confirm)="deleteCategory()"
                            (cancel)="showDeleteConfirm.set(false)" />
        }
      }
    }
  `,
})
export class CategoryListComponent implements OnInit {
  private readonly service = inject(CategoryService);

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

  navigateToNew(): void { }
  confirmDelete(c: Category): void { this.deletingCategory.set(c); this.showDeleteConfirm.set(true); }

  deleteCategory(): void {
    const c = this.deletingCategory();
    if (!c) return;
    this.showDeleteConfirm.set(false);
    this.service.delete(c.id).subscribe(() => this.load());
  }
}
