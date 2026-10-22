import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Cafe } from '../model/cafe.model';
import { CAFE_STORAGE_KEY, CafeService } from './cafe.service';

describe('CafeService', () => {
  let service: CafeService;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CAFE_STORAGE_KEY);
    }

    TestBed.configureTestingModule({
      providers: [CafeService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CafeService);
    service.resetToDefault();
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CAFE_STORAGE_KEY);
    }
  });

  it('loads the default initial cafes', async () => {
    const cafes = await firstValueFrom(service.getAll());
    expect(cafes.length).toBeGreaterThan(0);
    expect(cafes[0].name).toBe('Cafe Central');
  });

  it('adds a new cafe and includes it at the top of getAll() for the home panel', async () => {
    const newCafe: Cafe = {
      externalId: 'cafe-nueva-001',
      name: 'Nueva Cafetería de Especialidad',
      address: 'Thames 2020, Palermo',
      email: 'nueva@cafe.com',
      state: true,
      description: 'Café nuevo agregado por admin',
    };

    service.addCafe(newCafe);

    const cafes = await firstValueFrom(service.getAll());
    expect(cafes[0].externalId).toBe('cafe-nueva-001');
    expect(cafes[0].name).toBe('Nueva Cafetería de Especialidad');
    expect(cafes.some((c) => c.externalId === 'cafe-nueva-001')).toBe(true);
  });

  it('retrieves a cafe by external ID', async () => {
    const cafe = await firstValueFrom(service.getByExternalId('cafe-central-001'));
    expect(cafe).toBeDefined();
    expect(cafe?.externalId).toBe('cafe-central-001');
  });

  it('updates the state of a cafe', async () => {
    service.updateCafeStatus('cafe-central-001', false);

    const cafe = await firstValueFrom(service.getByExternalId('cafe-central-001'));
    expect(cafe?.state).toBe(false);
  });
});
