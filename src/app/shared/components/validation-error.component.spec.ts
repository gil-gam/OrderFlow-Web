import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl } from '@angular/forms';
import { ValidationErrorComponent } from './validation-error.component';

describe('ValidationErrorComponent', () => {
  let component: ValidationErrorComponent;
  let fixture: ComponentFixture<ValidationErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationErrorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should not display when control is null', () => {
    fixture.componentRef.setInput('control', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.children.length).toBe(0);
  });

  it('should not display when control is pristine', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.children.length).toBe(0);
  });

  it('should display required error when dirty', () => {
    const control = new FormControl('');
    control.markAsDirty();
    control.setErrors({ required: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('required');
  });

  it('should display email error when touched', () => {
    const control = new FormControl('invalid');
    control.markAsTouched();
    control.setErrors({ email: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('email');
  });

  it('should display minlength error', () => {
    const control = new FormControl('ab');
    control.markAsDirty();
    control.setErrors({ minlength: { requiredLength: 6 } });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('6');
  });

  it('should display passwordMismatch error', () => {
    const control = new FormControl('');
    control.markAsDirty();
    control.setErrors({ passwordMismatch: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Passwords do not match');
  });

  it('should display min error', () => {
    const control = new FormControl(-1);
    control.markAsDirty();
    control.setErrors({ min: { min: 0 } });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('0');
  });
});
