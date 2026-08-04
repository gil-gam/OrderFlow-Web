import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../../core/services/order.service';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderServiceMock: jasmine.SpyObj<OrderService>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockOrders = [
    {
      id: '1', customerId: 'c1', customerName: 'John', orderDate: baseDate, status: 'Pending' as const,
      items: [], totalAmount: 1500, createdAt: baseDate, updatedAt: baseDate
    },
    {
      id: '2', customerId: 'c2', customerName: 'Jane', orderDate: baseDate, status: 'Delivered' as const,
      items: [], totalAmount: 200, createdAt: baseDate, updatedAt: baseDate
    },
  ];

  const paginated = (items: unknown[]) => ({
    items, totalCount: items.length, page: 1, pageSize: 10,
    totalPages: items.length ? 1 : 0, hasNextPage: false, hasPreviousPage: false,
  });

  beforeEach(async () => {
    orderServiceMock = jasmine.createSpyObj('OrderService', ['getAll', 'delete']);
    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [provideRouter([]), { provide: OrderService, useValue: orderServiceMock }],
    }).compileComponents();
  });

  it('should load orders on init', () => {
    orderServiceMock.getAll.and.returnValue(of(paginated(mockOrders)));
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.orders().length).toBe(2);
    expect(component.state()).toBe('ready');
  });

  it('should show empty state', () => {
    orderServiceMock.getAll.and.returnValue(of(paginated([])));
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('empty');
  });

  it('should show error state', () => {
    orderServiceMock.getAll.and.returnValue(throwError(() => new Error('Failed')));
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('error');
  });

  it('should return correct badge class', () => {
    orderServiceMock.getAll.and.returnValue(of(paginated([])));
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.badgeClass('Pending')).toBe('badge-warning');
    expect(component.badgeClass('Delivered')).toBe('badge-success');
  });

  it('should confirmDelete and delete', () => {
    orderServiceMock.getAll.and.returnValue(of(paginated(mockOrders)));
    orderServiceMock.delete.and.returnValue(of(void 0));
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.confirmDelete(mockOrders[0]);
    expect(component.showDeleteConfirm()).toBeTrue();
    component.deleteOrder();
    expect(orderServiceMock.delete).toHaveBeenCalledWith('1');
  });
});
