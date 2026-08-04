import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrderFormComponent } from './order-form.component';
import { OrderService } from '../../core/services/order.service';
import { CustomerService } from '../../core/services/customer.service';
import { ProductService } from '../../core/services/product.service';

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let orderServiceMock: jasmine.SpyObj<OrderService>;
  let router: Router;

  const baseDate = '2026-01-01T00:00:00Z';

  beforeEach(async () => {
    orderServiceMock = jasmine.createSpyObj('OrderService', ['create']);

    const customerSvc = jasmine.createSpyObj('CustomerService', ['getAll']);
    const productSvc = jasmine.createSpyObj('ProductService', ['getAll']);
    customerSvc.getAll.and.returnValue(of([
      {
        id: '1', name: 'John', email: 'john@test.com', phone: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        createdAt: baseDate, updatedAt: baseDate
      },
    ]));
    productSvc.getAll.and.returnValue(of([
      {
        id: '1', name: 'Laptop', description: '', unitPrice: 1500, currency: 'USD',
        stockQuantity: 10, categoryId: '1', categoryName: 'Electronics', isActive: true, createdAt: baseDate
      },
    ]));

    await TestBed.configureTestingModule({
      imports: [OrderFormComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: orderServiceMock },
        { provide: CustomerService, useValue: customerSvc },
        { provide: ProductService, useValue: productSvc },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load customers and products', () => {
    expect(component.loading()).toBeFalse();
    expect(component.customers().length).toBe(1);
    expect(component.products().length).toBe(1);
  });

  it('should add and remove items', () => {
    component.addItem();
    expect(component.items.length).toBe(1);
    component.addItem();
    expect(component.items.length).toBe(2);
    component.removeItem(0);
    expect(component.items.length).toBe(1);
  });

  it('should call create on submit', () => {
    orderServiceMock.create.and.returnValue(of({ id: '1' } as any));
    component.form.patchValue({ customerId: '1' });
    component.addItem();
    component.items.at(0).patchValue({ productId: '1', quantity: 2 });
    component.onSubmit();
    expect(orderServiceMock.create).toHaveBeenCalledWith({
      customerId: '1',
      items: [{ productId: '1', quantity: 2 }],
    });
  });

  it('should navigate to /orders on success', () => {
    orderServiceMock.create.and.returnValue(of({ id: '1' } as any));
    component.form.patchValue({ customerId: '1' });
    component.addItem();
    component.items.at(0).patchValue({ productId: '1', quantity: 1 });
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  });

  it('should set error on failure', () => {
    orderServiceMock.create.and.returnValue(throwError(() => ({ message: 'Error' })));
    component.form.patchValue({ customerId: '1' });
    component.addItem();
    component.items.at(0).patchValue({ productId: '1', quantity: 1 });
    component.onSubmit();
    expect(component.error()).toBeTruthy();
  });
});
