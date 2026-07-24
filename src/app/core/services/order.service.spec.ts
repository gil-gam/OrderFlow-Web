import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockOrders = [
    {
      id: '1', customerId: 'c1', customerName: 'John Doe', orderDate: baseDate, status: 'Pending' as const,
      items: [], totalAmount: 2500, createdAt: baseDate, updatedAt: baseDate
    },
    {
      id: '2', customerId: 'c2', customerName: 'Jane Doe', orderDate: baseDate, status: 'Delivered' as const,
      items: [], totalAmount: 150, createdAt: baseDate, updatedAt: baseDate
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [OrderService] });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should GET /api/Orders', () => {
    service.getAll().subscribe(data => expect(data.length).toBe(2));
    httpMock.expectOne('/api/Orders').flush(mockOrders);
  });

  it('should GET /api/Orders/:id', () => {
    service.getById('1').subscribe(data => expect(data.customerName).toBe('John Doe'));
    httpMock.expectOne('/api/Orders/1').flush(mockOrders[0]);
  });

  it('should POST to /api/Orders', () => {
    const newOrder = { customerId: '1', items: [{ productId: '1', quantity: 2 }] };
    service.create(newOrder).subscribe(data => expect(data.id).toBe('3'));
    httpMock.expectOne('/api/Orders').flush({ ...mockOrders[0], id: '3' });
  });

  it('should DELETE /api/Orders/:id', () => {
    service.delete('1').subscribe();
    httpMock.expectOne('/api/Orders/1').flush(null);
  });
});
