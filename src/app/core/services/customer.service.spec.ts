import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { Customer } from '../models/customer.model';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockCustomers: Customer[] = [
    {
      id: '1', name: 'John Doe', email: 'john@test.com', phone: '11999999999',
      address: { street: 'Rua A', city: 'Curitiba', state: 'PR', zipCode: '80000', country: 'BR' },
      createdAt: baseDate, updatedAt: baseDate
    },
    {
      id: '2', name: 'Jane Doe', email: 'jane@test.com', phone: '11888888888',
      address: { street: 'Rua B', city: 'São Paulo', state: 'SP', zipCode: '01000', country: 'BR' },
      createdAt: baseDate, updatedAt: baseDate
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CustomerService] });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should GET /api/customers', () => {
    service.getAll().subscribe(data => expect(data).toEqual(mockCustomers));
    httpMock.expectOne('/api/customers').flush(mockCustomers);
  });

  it('should GET /api/customers/:id', () => {
    service.getById('1').subscribe(data => expect(data.name).toBe('John Doe'));
    httpMock.expectOne('/api/customers/1').flush(mockCustomers[0]);
  });

  it('should POST to /api/customers', () => {
    const newCustomer = {
      name: 'New', email: 'new@test.com', phone: '11777777777',
      address: { street: 'Rua C', city: 'Curitiba', state: 'PR', zipCode: '80000', country: 'BR' }
    };
    service.create(newCustomer).subscribe(data => expect(data.id).toBe('3'));
    httpMock.expectOne('/api/customers').flush({ id: '3', ...newCustomer, createdAt: baseDate, updatedAt: baseDate });
  });

  it('should PUT /api/customers/:id', () => {
    const update = { name: 'Updated', email: 'updated@test.com', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } };
    service.update('1', update).subscribe(data => expect(data.name).toBe('Updated'));
    httpMock.expectOne('/api/customers/1').flush({ ...mockCustomers[0], name: 'Updated' });
  });

  it('should DELETE /api/customers/:id', () => {
    service.delete('1').subscribe();
    httpMock.expectOne('/api/customers/1').flush(null);
  });
});
