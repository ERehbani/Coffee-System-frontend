import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cafe } from '../../model/cafe.model';
import { CAFE_CENTRAL_FIXTURE, CLOSED_CAFE_FIXTURE } from '../../utils/cafe.fixture';
import { CafeCard } from './cafe-card';

describe('CafeCard', () => {
  function render(cafe: Cafe): ComponentFixture<CafeCard> {
    const fixture = TestBed.createComponent(CafeCard);
    fixture.componentRef.setInput('cafe', cafe);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 16, 10, 0));
    await TestBed.configureTestingModule({ imports: [CafeCard], providers: [provideRouter([])] }).compileComponents();
  });

  afterEach(() => vi.useRealTimers());

  it('says the cafe is open when the backend calculates it is inside its hours', () => {
    const text = render(CAFE_CENTRAL_FIXTURE).nativeElement.textContent;

    expect(text).toContain('Abierto ahora');
    expect(text).toContain('Hoy 08:00–20:00');
  });

  it('says the cafe is closed outside its hours even if the cafe is active', () => {
    const text = render(CLOSED_CAFE_FIXTURE).nativeElement.textContent;

    expect(CLOSED_CAFE_FIXTURE.state).toBe(true);
    expect(text).toContain('Cerrado');
    expect(text).toContain('Hoy no abre');
  });
});
