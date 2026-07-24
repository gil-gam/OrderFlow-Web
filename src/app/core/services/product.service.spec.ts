import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockProducts: Product[] = [
    {
      id: '1', name: 'Laptop', description: 'Good laptop', price: 1500, stockQuantity: 10,
      categoryId: '1', categoryName: 'Electronics', isActive: true, createdAt: baseDate, updatedAt: baseDate
    },
    {
      id: '2', name: 'T-Shirt', description: '', price: 25, stockQuantity: 0,
      categoryId: '2', categoryName: 'Clothing', isActive: true, createdAt: baseDate, updatedAt: baseDate
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ProductService] });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should GET /api/products', () => {
    service.getAll().subscribe(data => expect(data.length).toBe(2));
    httpMock.expectOne('/api/products').flush(mockProducts);
  });

  it('should GET /api/products/:id', () => {
    service.getById('1').subscribe(data => expect(data.name).toBe('Laptop'));
    httpMock.expectOne('/api/products/1').flush(mockProducts[0]);
  });

  it('should POST to /api/products', () => {
    const newProduct = { name: 'Mouse', description: '', price: 50, stockQuantity: 200, categoryId: '1' };
    service.create(newProduct).subscribe(data => expect(data.name).toBe('Mouse'));
    httpMock.expectOne('/api/products').flush({ id: '3', ...newProduct, categoryName: 'Electronics', isActive: true, createdAt: baseDate, updatedAt: baseDate });
  });

  it('should PUT /api/products/:id', () => {
    const update = { name: 'Updated', description: '', price: 1800, stockQuantity: 10, categoryId: '1' };
    service.update('1', update).subscribe(data => expect(data.price).toBe(1800));
    httpMock.expectOne('/api/products/1').flush({ ...mockProducts[0], price: 1800 });
  });

  it('should DELETE /api/products/:id', () => {
    service.delete('1').subscribe();
    httpMock.expectOne('/api/products/1').flush(null);
  });
});
