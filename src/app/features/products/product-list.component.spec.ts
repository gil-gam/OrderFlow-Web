import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: jasmine.SpyObj<ProductService>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockProducts: Product[] = [
    {
      id: '1', name: 'Laptop', price: 1500, stockQuantity: 10, categoryId: '1', categoryName: 'Electronics',
      isActive: true, description: '', createdAt: baseDate, updatedAt: baseDate
    },
    {
      id: '2', name: 'T-Shirt', price: 25, stockQuantity: 0, categoryId: '2', categoryName: 'Clothing',
      isActive: true, description: '', createdAt: baseDate, updatedAt: baseDate
    }
  ];

  beforeEach(async () => {
    productServiceMock = jasmine.createSpyObj('ProductService', ['getAll', 'delete']);
    await TestBed.configureTestingModule({
      imports: [ProductListComponent, RouterTestingModule.withRoutes([])],
      providers: [{ provide: ProductService, useValue: productServiceMock }]
    }).compileComponents();
  });

  it('should load products on init', () => {
    productServiceMock.getAll.and.returnValue(of(mockProducts));
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.products().length).toBe(2);
    expect(component.state()).toBe('ready');
  });

  it('should show empty state', () => {
    productServiceMock.getAll.and.returnValue(of([]));
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('empty');
  });

  it('should show error state', () => {
    productServiceMock.getAll.and.returnValue(throwError(() => new Error('Failed')));
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('error');
  });

  it('should confirmDelete and delete', () => {
    productServiceMock.getAll.and.returnValue(of(mockProducts));
    productServiceMock.delete.and.returnValue(of(void 0));
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.confirmDelete(mockProducts[0]);
    expect(component.showDeleteConfirm()).toBeTrue();
    component.deleteProduct();
    expect(productServiceMock.delete).toHaveBeenCalledWith('1');
  });
});
