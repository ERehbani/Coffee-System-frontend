import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClientLayout } from './client-layout';

describe('ClientLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLayout],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the routed content inside the main landmark, followed by the bottom navigation', async () => {
    const fixture = TestBed.createComponent(ClientLayout);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('main router-outlet')).not.toBeNull();
    expect(host.querySelector('main ~ app-bottom-nav nav')).not.toBeNull();
  });
});
