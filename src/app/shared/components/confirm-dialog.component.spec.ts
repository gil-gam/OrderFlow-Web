import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Delete');
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should display title', () => {
    expect(fixture.nativeElement.textContent).toContain('Delete');
  });

  it('should display message when provided', () => {
    fixture.componentRef.setInput('message', 'Are you sure?');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Are you sure?');
  });

  it('should show confirm and cancel buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should emit confirm on button click', () => {
    spyOn(component.confirm, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[1] as HTMLButtonElement).click();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel on cancel click', () => {
    spyOn(component.cancel, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[0] as HTMLButtonElement).click();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should display custom confirm label', () => {
    fixture.componentRef.setInput('confirmLabel', 'Yes, delete');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Yes, delete');
  });
});
