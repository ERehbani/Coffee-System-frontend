import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NearbyCafe } from '../../domain/client-dashboard.model';
import { NearbyCafeCard } from './nearby-cafe-card';

describe('NearbyCafeCard', () => {
  const cafeNorte: NearbyCafe = {
    id: 'cafe-norte',
    name: 'Cafe Norte',
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=192',
    rating: 4.8,
    reviewCount: 8,
    isOpenNow: false,
    distanceMeters: 450,
    maxPointsPerProduct: null,
    tagline: 'Tostado de origen único & filtrados V60',
  };
  let fixture: ComponentFixture<NearbyCafeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NearbyCafeCard],
    }).compileComponents();
    fixture = TestBed.createComponent(NearbyCafeCard);
  });

  async function renderText(cafe: NearbyCafe): Promise<string> {
    fixture.componentRef.setInput('cafe', cafe);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';
  }

  it('shows the distance and the tagline when the cafe does not award points', async () => {
    const content = await renderText(cafeNorte);

    expect(content).toContain('Cafe Norte');
    expect(content).toContain('Calificación 4.8 • 8 reseñas');
    expect(content).toContain('A 450m');
    expect(content).toContain('Tostado de origen único & filtrados V60');
    expect(content).not.toContain('Abierto ahora');
  });

  it('shows the open chip and the points line instead of the tagline', async () => {
    const content = await renderText({
      ...cafeNorte,
      isOpenNow: true,
      distanceMeters: null,
      maxPointsPerProduct: 80,
      reviewCount: 1,
    });

    expect(content).toContain('Abierto ahora');
    expect(content).toContain('Otorga hasta 80 pts por producto');
    expect(content).toContain('1 reseña');
    expect(content).not.toContain('Tostado de origen');
    expect(content).not.toMatch(/A \d/);
  });

  it('formats distances of one kilometer or more in kilometers', async () => {
    expect(await renderText({ ...cafeNorte, distanceMeters: 1250 })).toContain('A 1.3km');
  });
});
