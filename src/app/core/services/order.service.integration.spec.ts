import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderService } from './order.service';

describe('OrderService (integration)', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [OrderService] });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should complete full CRUD cycle', () => {
    // 1. CREATE with items
    const newOrder = {
      customerId: 'c1',
      items: [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 }
      ]
    };

    service.create(newOrder).subscribe(data => {
      expect(data.id).toBe('99');
      expect(data.customerName).toBe('John Doe');
      expect(data.status).toBe('Pending');
    });
    httpMock.expectOne('/api/Orders').flush({
      id: '99', customerId: 'c1', customerName: 'John Doe',
      orderDate: baseDate, status: 'Pending' as const,
      items: [
        { productId: 'p1', productName: 'Laptop', quantity: 2, unitPrice: 1500 },
        { productId: 'p2', productName: 'Mouse', quantity: 1, unitPrice: 50 }
      ],
      totalAmount: 3050, createdAt: baseDate, updatedAt: baseDate
    });

    // 2. GET BY ID
    service.getById('99').subscribe(data => {
      expect(data.items.length).toBe(2);
      expect(data.totalAmount).toBe(3050);
      expect(data.status).toBe('Pending');
    });
    httpMock.expectOne('/api/Orders/99').flush({
      id: '99', customerId: 'c1', customerName: 'John Doe',
      orderDate: baseDate, status: 'Pending' as const,
      items: [
        { productId: 'p1', productName: 'Laptop', quantity: 2, unitPrice: 1500 },
        { productId: 'p2', productName: 'Mouse', quantity: 1, unitPrice: 50 }
      ],
      totalAmount: 3050, createdAt: baseDate, updatedAt: baseDate
    });

    // 3. GET ALL (verify order appears in list)
    service.getAll().subscribe(data => {
      expect(data.length).toBeGreaterThanOrEqual(1);
      const order = data.find(o => o.id === '99');
      expect(order).toBeDefined();
      expect(order!.customerName).toBe('John Doe');
    });
    httpMock.expectOne('/api/Orders').flush([
      {
        id: '99', customerId: 'c1', customerName: 'John Doe',
        orderDate: baseDate, status: 'Pending' as const,
        items: [], totalAmount: 3050, createdAt: baseDate, updatedAt: baseDate
      }
    ]);

    // 4. DELETE
    service.delete('99').subscribe(response => {
      expect(response).toBeNull();
    });
    const deleteReq = httpMock.expectOne('/api/Orders/99');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
