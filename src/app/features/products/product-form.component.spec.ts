import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceMock: jasmine.SpyObj<ProductService>;
  let routerMock: jasmine.SpyObj<Router>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockCategories = [
    { id: '1', name: 'Electronics', description: 'Eletrônicos' },
    { id: '2', name: 'Clothing', description: 'Vestuário' }
  ];
  const mockProduct = {
    id: '1', name: 'Laptop', description: 'Good', price: 1500,
    stockQuantity: 10, categoryId: '1', categoryName: 'Electronics',
    isActive: true, createdAt: baseDate, updatedAt: baseDate
  };

  const createComponent = (isEdit = false) => {
    productServiceMock = jasmine.createSpyObj('ProductService', ['getById', 'create', 'update']);
    const categorySvc = jasmine.createSpyObj('CategoryService', ['getAll']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    categorySvc.getAll.and.returnValue(of(mockCategories));
    if (isEdit) productServiceMock.getById.and.returnValue(of(mockProduct));

    TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule, ValidationErrorComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: CategoryService, useValue: categorySvc },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => isEdit ? '1' : null } } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', () => { createComponent(); expect(component).toBeTruthy(); });

  it('should load categories', () => {
    createComponent();
    expect(component.categories().length).toBe(2);
  });

  it('should initialize empty form', () => {
    createComponent();
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('price')?.value).toBe(0);
    expect(component.form.get('stockQuantity')?.value).toBe(0);
  });

  it('should validate required fields', () => {
    createComponent();
    expect(component.form.valid).toBeFalse();
    component.form.patchValue({ name: 'Mouse', price: 50, stockQuantity: 100, categoryId: '1' });
    expect(component.form.valid).toBeTrue();
  });

  it('should call create on submit', () => {
    createComponent();
    productServiceMock.create.and.returnValue(of({ id: '3' } as any));
    component.form.patchValue({ name: 'Mouse', price: 50, stockQuantity: 100, categoryId: '1' });
    component.onSubmit();
    expect(productServiceMock.create).toHaveBeenCalled();
  });

  it('should navigate to /products on success', () => {
    createComponent();
    productServiceMock.create.and.returnValue(of({ id: '3' } as any));
    component.form.patchValue({ name: 'Mouse', price: 50, stockQuantity: 100, categoryId: '1' });
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should load data in edit mode', () => {
    createComponent(true);
    expect(productServiceMock.getById).toHaveBeenCalledWith('1');
    expect(component.isEdit()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('Laptop');
  });
});
