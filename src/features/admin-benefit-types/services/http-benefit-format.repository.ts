import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BenefitFormatDto } from '../types/benefit-format.dto';
import { BenefitFormat, SaveBenefitFormatInput } from '../types/benefit-format.model';
import {
  toBenefitFormat,
  toBenefitFormatList,
  toCreateBenefitFormatRequestDto,
  toUpdateBenefitFormatRequestDto,
} from '../utils/benefit-format.mapper';
import { BenefitFormatRepository } from './benefit-format.repository';

@Injectable()
export class HttpBenefitFormatRepository implements BenefitFormatRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/benefit-formats`;

  getFormats(): Observable<readonly BenefitFormat[]> {
    return this.http.get<readonly BenefitFormatDto[]>(this.url).pipe(map(toBenefitFormatList));
  }

  createFormat(input: SaveBenefitFormatInput): Observable<BenefitFormat> {
    return this.http
      .post<BenefitFormatDto>(this.url, toCreateBenefitFormatRequestDto(input))
      .pipe(map(toBenefitFormat));
  }

  updateFormat(id: string, input: SaveBenefitFormatInput): Observable<BenefitFormat> {
    return this.http
      .put<BenefitFormatDto>(`${this.url}/${id}`, toUpdateBenefitFormatRequestDto(input))
      .pipe(map(toBenefitFormat));
  }
}
