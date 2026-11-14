import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CafeProfile, UpdateCafeProfileInput } from '../types/cafe-profile.model';
import { CAFE_PROFILE_FIXTURE } from '../utils/cafe-profile.fixture';
import { HttpCafeProfileRepository } from './http-cafe-profile.repository';

describe('HttpCafeProfileRepository', () => {
  let repository: HttpCafeProfileRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpCafeProfileRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpCafeProfileRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks for the cafe of the signed-in user, without an id', () => {
    let profile: CafeProfile | undefined;
    repository.getProfile().subscribe((value) => (profile = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/cafes/me`);
    expect(request.request.method).toBe('GET');
    request.flush(CAFE_PROFILE_FIXTURE);

    expect(profile?.id).toBe(CAFE_PROFILE_FIXTURE.externalId);
    expect(profile?.name).toBe(CAFE_PROFILE_FIXTURE.name);
    expect(profile?.isOpen).toBe(true);
  });

  it('propagates a failure when the cafe cannot be loaded', () => {
    let status: number | undefined;
    repository.getProfile().subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`${environment.apiBaseUrl}/cafes/me`)
      .flush('Cafe not found', { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });

  it('updates the cafe by its id with the trimmed data', () => {
    const input: UpdateCafeProfileInput = {
      address: '  Av. Corrientes 1500  ',
      phoneNumber: '1145238890',
      description: 'Cafetería de especialidad',
      schedule: 'Lun a Vie 8-20',
      image: '',
    };
    let profile: CafeProfile | undefined;
    repository.updateProfile('cafe-9', input).subscribe((value) => (profile = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/cafes/cafe-9`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ ...input, address: 'Av. Corrientes 1500' });
    request.flush({ ...CAFE_PROFILE_FIXTURE, externalId: 'cafe-9', address: 'Av. Corrientes 1500' });

    expect(profile?.address).toBe('Av. Corrientes 1500');
  });
});
