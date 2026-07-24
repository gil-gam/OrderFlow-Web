import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService (integration)', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ProductService] });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should complete full CRUD cycle', () => {
    // 1. CREATE
    const newProduct = {
      name: 'Gaming Mouse',
      description: 'High DPI wireless mouse',
      price: 250,
      stockQuantity: 50,
      categoryId: '1'
    };

    service.create(newProduct).subscribe(data => {
      expect(data.id).toBe('99');
      expect(data.name).toBe('Gaming Mouse');
      expect(data.price).toBe(250);
      expect(data.stockQuantity).toBe(50);
    });
    httpMock.expectOne('/api/products').flush({
      id: '99', ...newProduct, categoryName: 'Electronics',
      isActive: true, createdAt: baseDate, updatedAt: baseDate
    });

    // 2. GET BY ID
    service.getById('99').subscribe(data => {
      expect(data.name).toBe('Gaming Mouse');
      expect(data.categoryName).toBe('Electronics');
      expect(data.isActive).toBeTrue();
    });
    httpMock.expectOne('/api/products/99').flush({
      id: '99', ...newProduct, categoryName: 'Electronics',
      isActive: true, createdAt: baseDate, updatedAt: baseDate
    });

    // 3. UPDATE
    service.update('99', {
      name: 'Gaming Mouse Pro',
      description: 'Updated high DPI wireless',
      price: 350,
      stockQuantity: 25,
      categoryId: '2'
    }).subscribe(data => {
      expect(data.price).toBe(350);
      expect(data.stockQuantity).toBe(25);
    });
    httpMock.expectOne('/api/products/99').flush({
      id: '99', name: 'Gaming Mouse Pro', description: 'Updated high DPI wireless',
      price: 350, stockQuantity: 25, categoryId: '2', categoryName: 'Peripherals',
      isActive: true, createdAt: baseDate, updatedAt: baseDate
    });

    // 4. DELETE
    service.delete('99').subscribe(response => {
      expect(response).toBeNull();
    });
    const deleteReq = httpMock.expectOne('/api/products/99');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
