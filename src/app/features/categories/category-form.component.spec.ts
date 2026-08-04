import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CategoryFormComponent } from './category-form.component';
import { CategoryService } from '../../core/services/category.service';
import { ValidationErrorComponent } from '../../shared/components/validation-error.component';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let routerMock: jasmine.SpyObj<Router>;

  const baseDate = '2026-01-01T00:00:00Z';
  const mockCategory = { id: '1', name: 'Electronics', description: 'Electronic items', isActive: true, createdAt: baseDate };

  const createComponent = async (isEditMode = false) => {
    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getById', 'create', 'update']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    if (isEditMode) categoryServiceMock.getById.and.returnValue(of(mockCategory));

    await TestBed.configureTestingModule({
      imports: [CategoryFormComponent, ReactiveFormsModule, ValidationErrorComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => (isEditMode ? '1' : null) } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create in creation mode', async () => { await createComponent(false); expect(component).toBeTruthy(); });

  it('should initialize empty form', async () => {
    await createComponent(false);
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
  });

  it('should validate name required', async () => {
    await createComponent(false);
    expect(component.form.get('name')?.errors?.['required']).toBeTruthy();
    component.form.patchValue({ name: 'Books' });
    expect(component.form.valid).toBeTrue();
  });

  it('should call create on submit', async () => {
    await createComponent(false);
    categoryServiceMock.create.and.returnValue(of({ ...mockCategory, id: '3' }));
    component.form.patchValue({ name: 'Books', description: 'Reading' });
    component.onSubmit();
    expect(categoryServiceMock.create).toHaveBeenCalledWith({ name: 'Books', description: 'Reading' });
  });

  it('should navigate to /categories on success', async () => {
    await createComponent(false);
    categoryServiceMock.create.and.returnValue(of({ ...mockCategory, id: '3' }));
    component.form.patchValue({ name: 'Books', description: 'Reading' });
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/categories']);
  });

  it('should load data in edit mode', async () => {
    await createComponent(true);
    expect(categoryServiceMock.getById).toHaveBeenCalledWith('1');
    expect(component.isEdit()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('Electronics');
  });

  it('should call update on submit in edit mode', async () => {
    await createComponent(true);
    categoryServiceMock.update.and.returnValue(of(mockCategory));
    component.form.patchValue({ name: 'Updated' });
    component.onSubmit();
    expect(categoryServiceMock.update).toHaveBeenCalledWith('1', jasmine.objectContaining({ name: 'Updated' }));
  });
});
