import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  let component: ErrorStateComponent;
  let fixture: ComponentFixture<ErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should display default title', () => {
    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
  });

  it('should display custom message', () => {
    fixture.componentRef.setInput('message', 'Failed to load orders');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Failed to load orders');
  });

  it('should show retry button by default', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toContain('Try again');
  });

  it('should hide retry button when showRetry is false', () => {
    fixture.componentRef.setInput('showRetry', false);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeFalsy();
  });

  it('should emit retry on button click', () => {
    spyOn(component.retry, 'emit');
    const btn = fixture.nativeElement.querySelector('button');
    btn?.click();
    expect(component.retry.emit).toHaveBeenCalled();
  });
});
