import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'No items');
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should display title', () => {
    expect(fixture.nativeElement.textContent).toContain('No items');
  });

  it('should display description when provided', () => {
    fixture.componentRef.setInput('description', 'Add your first item');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Add your first item');
  });

  it('should show action button when showAction is true', () => {
    fixture.componentRef.setInput('showAction', true);
    fixture.componentRef.setInput('actionLabel', 'Add New');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.textContent).toContain('Add New');
  });

  it('should emit action on button click', () => {
    spyOn(component.action, 'emit');
    fixture.componentRef.setInput('showAction', true);
    fixture.componentRef.setInput('actionLabel', 'Add');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    btn?.click();
    expect(component.action.emit).toHaveBeenCalled();
  });
});
