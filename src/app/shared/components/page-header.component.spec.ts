import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Products');
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Products');
  });

  it('should render subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Manage your catalog');
    fixture.detectChanges();
    const p = fixture.nativeElement.querySelector('p');
    expect(p?.textContent).toContain('Manage your catalog');
  });

  it('should not render subtitle when not provided', () => {
    const paragraphs = fixture.nativeElement.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
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
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    btn?.click();
    expect(component.action.emit).toHaveBeenCalled();
  });
});
