import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const mockCategories: Category[] = [
    { id: '1', name: 'Electronics', description: 'Electronic items', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: '2', name: 'Clothing', description: 'Apparel', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CategoryService] });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should GET /api/categories', () => {
    service.getAll().subscribe(data => expect(data).toEqual(mockCategories));
    httpMock.expectOne('/api/categories').flush(mockCategories);
  });

  it('should GET /api/categories/:id', () => {
    service.getById('1').subscribe(data => expect(data).toEqual(mockCategories[0]));
    httpMock.expectOne('/api/categories/1').flush(mockCategories[0]);
  });

  it('should POST to /api/categories', () => {
    const newCat = { name: 'Books', description: 'Reading' };
    service.create(newCat).subscribe(data => expect(data.id).toBe('3'));
    httpMock.expectOne('/api/categories').flush({ id: '3', ...newCat, createdAt: '', updatedAt: '' });
  });

  it('should PUT /api/categories/:id', () => {
    service.update('1', { name: 'Updated', description: 'Updated desc' }).subscribe(data => expect(data.name).toBe('Updated'));
    const req = httpMock.expectOne('/api/categories/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '1', name: 'Updated', description: 'Updated desc', createdAt: '', updatedAt: '' });
  });

  it('should DELETE /api/categories/:id', () => {
    service.delete('1').subscribe(response => {
      expect(response).toBeNull();
    });
    const req = httpMock.expectOne('/api/categories/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
