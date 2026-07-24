import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { CategoryService } from './category.service';

describe('CategoryService (integration)', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CategoryService] });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should complete full CRUD cycle', () => {
    // 1. CREATE
    const newCat = { name: 'Books', description: 'Paper books' };
    let createdId: string;

    service.create(newCat).subscribe(data => {
      createdId = data.id;
      expect(data.name).toBe('Books');
    });
    httpMock.expectOne('/api/categories').flush(
      { id: '99', ...newCat, createdAt: baseDate, updatedAt: baseDate }
    );

    // 2. GET BY ID (confirm create)
    service.getById('99').subscribe(data => {
      expect(data.name).toBe('Books');
    });
    httpMock.expectOne('/api/categories/99').flush(
      { id: '99', ...newCat, createdAt: baseDate, updatedAt: baseDate }
    );

    // 3. UPDATE
    service.update('99', { name: 'E-Books', description: 'Digital books' }).subscribe(data => {
      expect(data.name).toBe('E-Books');
    });
    httpMock.expectOne('/api/categories/99').flush(
      { id: '99', name: 'E-Books', description: 'Digital books', createdAt: baseDate, updatedAt: baseDate }
    );

    // 4. DELETE
    service.delete('99').subscribe(response => {
      expect(response).toBeNull();
    });
    const deleteReq = httpMock.expectOne('/api/categories/99');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
