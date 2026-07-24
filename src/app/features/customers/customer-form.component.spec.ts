import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomerFormComponent } from './customer-form.component';
import { CustomerService } from '../../core/services/customer.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

describe('CustomerFormComponent', () => {
  let component: CustomerFormComponent;
  let fixture: ComponentFixture<CustomerFormComponent>;
  let customerServiceMock: jasmine.SpyObj<CustomerService>;
  let routerMock: jasmine.SpyObj<Router>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockCustomer = {
    id: '1', name: 'John Doe', email: 'john@test.com', phone: '11999999999',
    address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
    createdAt: baseDate, updatedAt: baseDate
  };

  const createComponent = (isEdit = false) => {
    customerServiceMock = jasmine.createSpyObj('CustomerService', ['getById', 'create', 'update']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    if (isEdit) customerServiceMock.getById.and.returnValue(of(mockCustomer));

    TestBed.configureTestingModule({
      imports: [CustomerFormComponent, ReactiveFormsModule, ValidationErrorComponent],
      providers: [
        { provide: CustomerService, useValue: customerServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => isEdit ? '1' : null } } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', () => { createComponent(); expect(component).toBeTruthy(); });

  it('should initialize empty form', () => {
    createComponent();
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
  });

  it('should validate required fields', () => {
    createComponent();
    expect(component.form.valid).toBeFalse();
    component.form.patchValue({ name: 'New', email: 'new@test.com' });
    expect(component.form.valid).toBeTrue();
  });

  it('should call create on submit', () => {
    createComponent();
    customerServiceMock.create.and.returnValue(of({ ...mockCustomer, id: '3' }));
    component.form.patchValue({ name: 'New', email: 'new@test.com', phone: '' });
    component.onSubmit();
    expect(customerServiceMock.create).toHaveBeenCalled();
  });

  it('should navigate to /customers on success', () => {
    createComponent();
    customerServiceMock.create.and.returnValue(of({ ...mockCustomer, id: '3' }));
    component.form.patchValue({ name: 'New', email: 'new@test.com', phone: '' });
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/customers']);
  });

  it('should load data in edit mode', () => {
    createComponent(true);
    expect(customerServiceMock.getById).toHaveBeenCalledWith('1');
    expect(component.isEdit()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('John Doe');
  });
});
