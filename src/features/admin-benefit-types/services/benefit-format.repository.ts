import { Observable } from 'rxjs';
import { BenefitFormat, SaveBenefitFormatInput } from '../types/benefit-format.model';

export abstract class BenefitFormatRepository {
  /** Every format in the catalog, ordered by name. */
  abstract getFormats(): Observable<readonly BenefitFormat[]>;
  /** Registers `input.code` in the catalog. */
  abstract createFormat(input: SaveBenefitFormatInput): Observable<BenefitFormat>;
  /** Edits the name, description and flag; the code of a registered format never changes. */
  abstract updateFormat(id: string, input: SaveBenefitFormatInput): Observable<BenefitFormat>;
}
