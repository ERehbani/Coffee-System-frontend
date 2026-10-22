import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AdminUserService } from '../../admin-users/services/admin-user.service';
import { CafeService } from '../../home/services/cafe.service';
import { CreateCafeInput } from '../types/admin-cafe.model';
import { MockAdminCafeRepository } from './mock-admin-cafe.repository';

describe('MockAdminCafeRepository', () => {
  let repository: MockAdminCafeRepository;
  let cafeService: CafeService;
  let userService: AdminUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockAdminCafeRepository,
        CafeService,
        AdminUserService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    repository = TestBed.inject(MockAdminCafeRepository);
    cafeService = TestBed.inject(CafeService);
    userService = TestBed.inject(AdminUserService);

    cafeService.resetToDefault();
    userService.resetToDefault();
  });

  it('registers a cafe and saves both cafe in CafeService and owner in AdminUserService', async () => {
    const input: CreateCafeInput = {
      ownerName: 'Florencia Benítez',
      name: 'Café de la Plaza',
      address: 'Plaza Serrano 500, CABA',
      email: 'florencia@cafedelaplaza.com',
      password: 'Password123',
      phoneNumber: '+54 11 4444-5555',
      schedule: 'Todos los días 08:00 - 20:00',
    };

    const createdCafe = await firstValueFrom(repository.registerCafe(input));
    expect(createdCafe.name).toBe('Café de la Plaza');
    expect(createdCafe.email).toBe('florencia@cafedelaplaza.com');

    // 1. Verify cafe was registered in CafeService
    const homeCafes = await firstValueFrom(cafeService.getAll());
    expect(homeCafes[0].name).toBe('Café de la Plaza');
    expect(homeCafes[0].externalId).toBe(createdCafe.externalId);

    // 2. Verify owner was registered in AdminUserService with role cafe_admin
    const users = await firstValueFrom(userService.getUsers());
    const ownerUser = users.find((u) => u.email === 'florencia@cafedelaplaza.com');
    expect(ownerUser).toBeDefined();
    expect(ownerUser?.role).toBe('cafe_admin');
    expect(ownerUser?.firstName).toBe('Florencia');
    expect(ownerUser?.lastName).toBe('Benítez');
    expect(ownerUser?.cafeAdminDetails?.cafeName).toBe('Café de la Plaza');
    expect(ownerUser?.cafeAdminDetails?.cafeAddress).toBe('Plaza Serrano 500, CABA');
  });

  it('synchronizes cafe state toggle with owner user status in AdminUserService', async () => {
    const input: CreateCafeInput = {
      ownerName: 'Luciano Castro',
      name: 'Café San Telmo',
      address: 'Defensa 800, San Telmo, CABA',
      email: 'luciano@santelmo.coffee',
      password: 'Password123',
    };

    const createdCafe = await firstValueFrom(repository.registerCafe(input));

    // Toggle status to inactive
    await firstValueFrom(repository.updateCafeStatus(createdCafe.externalId, false));

    const users = await firstValueFrom(userService.getUsers());
    const ownerUser = users.find((u) => u.email === 'luciano@santelmo.coffee');
    expect(ownerUser?.status).toBe('inactive');

    // Toggle back to active
    await firstValueFrom(repository.updateCafeStatus(createdCafe.externalId, true));
    const reloadedUsers = await firstValueFrom(userService.getUsers());
    const reloadedOwner = reloadedUsers.find((u) => u.email === 'luciano@santelmo.coffee');
    expect(reloadedOwner?.status).toBe('active');
  });
});
