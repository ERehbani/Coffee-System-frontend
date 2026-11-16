import { Cafe } from '../model/cafe.model';

export const CAFE_CENTRAL_FIXTURE: Cafe = {
  externalId: 'cafe-central-001',
  name: 'Cafe Central',
  address: 'Av Siempreviva 123',
  email: 'cafe.central@test.com',
  phoneNumber: '1111111111',
  description: 'Cafeteria de prueba en el centro',
  state: true,
  openNow: true,
  openingHours: [{ day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' }],
  image: null,
};

export const CAFE_NORTE_FIXTURE: Cafe = {
  externalId: 'cafe-norte-001',
  name: 'Cafe Norte',
  address: 'Calle Falsa 456',
  email: 'cafe.norte@test.com',
  phoneNumber: '2222222222',
  description: 'Cafeteria de prueba zona norte',
  state: true,
  openNow: true,
  openingHours: [{ day: 'SATURDAY', opensAt: '09:00', closesAt: '22:00' }],
  image: null,
};

export const CLOSED_CAFE_FIXTURE: Cafe = {
  externalId: 'tostado-club-001',
  name: 'Tostado Club',
  address: 'Thames 1600',
  email: 'tostado.club@test.com',
  phoneNumber: null,
  description: null,
  state: true,
  openNow: false,
  openingHours: [],
  image: null,
};

export const CAFES_FIXTURE: Cafe[] = [CAFE_CENTRAL_FIXTURE, CAFE_NORTE_FIXTURE, CLOSED_CAFE_FIXTURE];
