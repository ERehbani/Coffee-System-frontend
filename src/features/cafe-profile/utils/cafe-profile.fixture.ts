import { CafeResponseDto } from '../types/cafe-profile.dto';

const UNSPLASH = 'https://images.unsplash.com';

export const CAFE_PROFILE_FIXTURE: CafeResponseDto = {
  externalId: 'cafe-central-001',
  name: 'Café Central',
  address: 'Av. Corrientes 1450, CABA',
  email: 'contacto@cafecentral.com.ar',
  phoneNumber: '1145238890',
  description: 'Cafetería de especialidad con granos seleccionados de origen único, filtrados manuales y pastelería artesanal horneada todos los días.',
  state: true,
  logo: `${UNSPLASH}/photo-1509042239860-f550ce710b93?w=200`,
  image: `${UNSPLASH}/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop&q=80&auto=format`,
  openingHours: [
    { day: 'MONDAY', opensAt: '07:30:00', closesAt: '20:00:00' },
    { day: 'TUESDAY', opensAt: '07:30:00', closesAt: '20:00:00' },
    { day: 'SATURDAY', opensAt: '08:30:00', closesAt: '19:00:00' },
  ],
  openNow: true,
  profileComplete: true,
};
