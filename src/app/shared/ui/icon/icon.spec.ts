import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { ICONS } from './icon-registry';

describe('Icon', () => {
  let fixture: ComponentFixture<Icon>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icon],
    }).compileComponents();

    fixture = TestBed.createComponent(Icon);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('name', 'coffee');
  });

  it('renders the path data of the requested icon and is hidden from assistive tech', async () => {
    await fixture.whenStable();

    expect(host.querySelectorAll('path').length).toBe(ICONS.coffee.length);
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('is exposed as a labeled image when a label is given', async () => {
    fixture.componentRef.setInput('label', 'Café');
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Café');
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });
});
