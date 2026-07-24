import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { CategoryService } from '../../core/services/category.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: OrderService, useValue: jasmine.createSpyObj('OrderService', ['getAll']) },
        { provide: ProductService, useValue: jasmine.createSpyObj('ProductService', ['getAll']) },
        { provide: CustomerService, useValue: jasmine.createSpyObj('CustomerService', ['getAll']) },
        { provide: CategoryService, useValue: jasmine.createSpyObj('CategoryService', ['getAll']) }
      ]
    }).compileComponents();
  });

  it('should load data on init', () => {
    const orderSvc = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    const productSvc = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    const customerSvc = TestBed.inject(CustomerService) as jasmine.SpyObj<CustomerService>;
    const categorySvc = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;

    orderSvc.getAll.and.returnValue(of([]));
    productSvc.getAll.and.returnValue(of([]));
    customerSvc.getAll.and.returnValue(of([]));
    categorySvc.getAll.and.returnValue(of([]));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.stats.length).toBe(4);
  });

  it('should return correct badge class', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    expect(component.statusBadge('Pending')).toBe('badge-warning');
    expect(component.statusBadge('Delivered')).toBe('badge-success');
    expect(component.statusBadge('Cancelled')).toBe('badge-danger');
  });
});
