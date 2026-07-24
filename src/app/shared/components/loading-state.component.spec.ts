import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
  let component: LoadingStateComponent;
  let fixture: ComponentFixture<LoadingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should display default loading message', () => {
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });

  it('should display custom message', () => {
    fixture.componentRef.setInput('message', 'Fetching orders...');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Fetching orders...');
  });

  it('should show spinner element', () => {
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });
});
