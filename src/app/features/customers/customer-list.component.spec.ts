import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomerListComponent } from './customer-list.component';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';

describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let customerServiceMock: jasmine.SpyObj<CustomerService>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockCustomers: Customer[] = [
    {
      id: '1', name: 'John Doe', email: 'john@test.com', phone: '11999999999',
      address: { street: 'Rua A', city: 'Curitiba', state: 'PR', zipCode: '80000', country: 'BR' },
      createdAt: baseDate, updatedAt: baseDate,
    },
    {
      id: '2', name: 'Jane Doe', email: 'jane@test.com', phone: '11888888888',
      address: { street: 'Rua B', city: 'São Paulo', state: 'SP', zipCode: '01000', country: 'BR' },
      createdAt: baseDate, updatedAt: baseDate,
    },
  ];

  beforeEach(async () => {
    customerServiceMock = jasmine.createSpyObj('CustomerService', ['getAll', 'delete']);
    await TestBed.configureTestingModule({
      imports: [CustomerListComponent],
      providers: [provideRouter([]), { provide: CustomerService, useValue: customerServiceMock }],
    }).compileComponents();
  });

  it('should load customers on init', () => {
    customerServiceMock.getAll.and.returnValue(of(mockCustomers));
    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.customers().length).toBe(2);
    expect(component.state()).toBe('ready');
  });

  it('should show empty state', () => {
    customerServiceMock.getAll.and.returnValue(of([]));
    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('empty');
  });

  it('should show error state', () => {
    customerServiceMock.getAll.and.returnValue(throwError(() => new Error('Failed')));
    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.state()).toBe('error');
  });

  it('should confirmDelete and delete', () => {
    customerServiceMock.getAll.and.returnValue(of(mockCustomers));
    customerServiceMock.delete.and.returnValue(of(void 0));
    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.confirmDelete(mockCustomers[0]);
    expect(component.showDeleteConfirm()).toBeTrue();
    component.deleteCustomer();
    expect(customerServiceMock.delete).toHaveBeenCalledWith('1');
  });
});
