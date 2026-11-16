import { BenefitFormatCode } from './benefit-format.model';

/** `GET /benefit-formats` item and the response of `POST` and `PUT /benefit-formats/{externalId}`. */
export interface BenefitFormatDto {
  readonly externalId: string;
  readonly code: BenefitFormatCode;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
  readonly usageCount: number;
}

/** Body of `POST /benefit-formats`. */
export interface CreateBenefitFormatRequestDto {
  readonly code: BenefitFormatCode | null;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}

/** Body of `PUT /benefit-formats/{externalId}`. */
export interface UpdateBenefitFormatRequestDto {
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}
