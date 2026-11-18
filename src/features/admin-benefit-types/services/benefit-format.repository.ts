import { Observable } from 'rxjs';
import { BenefitFormat, SaveBenefitFormatInput } from '../types/benefit-format.model';

export abstract class BenefitFormatRepository {
  abstract getFormats(): Observable<readonly BenefitFormat[]>;
  abstract createFormat(input: SaveBenefitFormatInput): Observable<BenefitFormat>;
  abstract updateFormat(id: string, input: SaveBenefitFormatInput): Observable<BenefitFormat>;
}
