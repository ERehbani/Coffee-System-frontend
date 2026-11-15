import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminClientDto } from '../types/admin-client.dto';
import { AdminClient } from '../types/admin-client.model';
import { toAdminClientList } from '../utils/admin-client.mapper';
import { AdminClientRepository } from './admin-client.repository';

@Injectable()
export class HttpAdminClientRepository implements AdminClientRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/clients`;

  getClients(): Observable<readonly AdminClient[]> {
    return this.http.get<AdminClientDto[]>(this.baseUrl).pipe(map(toAdminClientList));
  }
}
