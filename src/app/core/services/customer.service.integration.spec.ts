import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';

describe('CustomerService (integration)', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CustomerService] });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should complete full CRUD cycle', () => {
    const address = { street: 'Rua A', city: 'Curitiba', state: 'PR', zipCode: '80000', country: 'BR' };

    // 1. CREATE
    const newCustomer = {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '11999999999',
      address
    };

    service.create(newCustomer).subscribe(data => {
      expect(data.id).toBe('99');
      expect(data.name).toBe('John Doe');
      expect(data.address.city).toBe('Curitiba');
    });
    httpMock.expectOne('/api/customers').flush({
      id: '99', ...newCustomer, createdAt: baseDate, updatedAt: baseDate
    });

    // 2. GET BY ID
    service.getById('99').subscribe(data => {
      expect(data.name).toBe('John Doe');
      expect(data.phone).toBe('11999999999');
    });
    httpMock.expectOne('/api/customers/99').flush({
      id: '99', ...newCustomer, createdAt: baseDate, updatedAt: baseDate
    });

    // 3. UPDATE
    const updatedAddress = { street: 'Rua B', city: 'São Paulo', state: 'SP', zipCode: '01000', country: 'BR' };
    service.update('99', {
      name: 'John Updated',
      email: 'john.updated@test.com',
      phone: '11888888888',
      address: updatedAddress
    }).subscribe(data => {
      expect(data.name).toBe('John Updated');
      expect(data.address.city).toBe('São Paulo');
    });
    httpMock.expectOne('/api/customers/99').flush({
      id: '99', name: 'John Updated', email: 'john.updated@test.com',
      phone: '11888888888', address: updatedAddress,
      createdAt: baseDate, updatedAt: baseDate
    });

    // 4. DELETE
    service.delete('99').subscribe(response => {
      expect(response).toBeNull();
    });
    const deleteReq = httpMock.expectOne('/api/customers/99');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
