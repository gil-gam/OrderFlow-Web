import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrderDetailComponent } from './order-detail.component';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

describe('OrderDetailComponent', () => {
  let fixture: ComponentFixture<OrderDetailComponent>;
  let component: OrderDetailComponent;
  let service: jasmine.SpyObj<OrderService>;

  const order: Order = {
    id: 'ord-1', customerId: 'c1', customerName: 'Jane Doe', orderDate: '2026-01-01T00:00:00Z',
    status: 'Delivered',
    items: [{ productId: 'p1', productName: 'Cola', unitPrice: 2.5, quantity: 2, totalPrice: 5 }],
    totalAmount: 5, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj('OrderService', ['getById']);
    service.getById.and.returnValue(of(order));

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'ord-1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('loads the order by route id', () => {
    expect(service.getById).toHaveBeenCalledWith('ord-1');
    expect(component.order()).toEqual(order);
    expect(component.state()).toBe('ready');
  });

  it('goes to error state when loading fails', () => {
    service.getById.and.returnValue(throwError(() => new Error('Not found')));
    component.loadOrder();
    expect(component.state()).toBe('error');
    expect(component.errorMessage()).toBe('Not found');
  });

  it('maps statuses to badge classes', () => {
    expect(component.badgeClass('Shipped')).toBe('badge-info');
    expect(component.badgeClass('Cancelled')).toBe('badge-danger');
  });
});
