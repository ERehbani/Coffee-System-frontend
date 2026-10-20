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
  schedule: 'Lun a Vie 07:30 - 20:00 | Sáb y Dom 08:30 - 19:00',
  image: `${UNSPLASH}/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop&q=80&auto=format`,
};
