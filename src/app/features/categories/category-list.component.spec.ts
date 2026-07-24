import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CategoryListComponent } from './category-list.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockCategories: Category[] = [
    { id: '1', name: 'Electronics', description: 'Electronic items', createdAt: baseDate, updatedAt: baseDate },
    { id: '2', name: 'Clothing', description: 'Apparel', createdAt: baseDate, updatedAt: baseDate }
  ];

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getAll', 'delete']);
    await TestBed.configureTestingModule({
      imports: [CategoryListComponent, RouterTestingModule.withRoutes([])],
      providers: [{ provide: CategoryService, useValue: categoryServiceMock }]
    }).compileComponents();
  });

  it('should load categories on init', () => {
    categoryServiceMock.getAll.and.returnValue(of(mockCategories));
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.categories().length).toBe(2);
    expect(component.state()).toBe('ready');
  });

  it('should show empty state', () => {
    categoryServiceMock.getAll.and.returnValue(of([]));
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('empty');
  });

  it('should show error state', () => {
    categoryServiceMock.getAll.and.returnValue(throwError(() => new Error('Failed')));
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('error');
  });

  it('should set deletingCategory on confirmDelete', () => {
    categoryServiceMock.getAll.and.returnValue(of(mockCategories));
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.confirmDelete(mockCategories[0]);
    expect(component.showDeleteConfirm()).toBeTrue();
  });

  it('should call delete and reload', () => {
    categoryServiceMock.getAll.and.returnValue(of(mockCategories));
    categoryServiceMock.delete.and.returnValue(of(void 0));
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.deletingCategory.set(mockCategories[0]);
    component.deleteCategory();
    expect(categoryServiceMock.delete).toHaveBeenCalledWith('1');
  });
});
