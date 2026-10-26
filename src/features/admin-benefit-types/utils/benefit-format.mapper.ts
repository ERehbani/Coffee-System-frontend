import {
  BenefitFormatDto,
  CreateBenefitFormatRequestDto,
  UpdateBenefitFormatRequestDto,
} from '../types/benefit-format.dto';
import { BenefitFormat, SaveBenefitFormatInput } from '../types/benefit-format.model';

export function toBenefitFormat(dto: BenefitFormatDto): BenefitFormat {
  return {
    id: dto.externalId,
    code: dto.code,
    displayName: dto.displayName,
    description: dto.description,
    active: dto.active,
    usageCount: dto.usageCount,
  };
}

/** Orders formats by name, ignoring the letter case, as the backend does. */
export function sortBenefitFormats(formats: readonly BenefitFormat[]): readonly BenefitFormat[] {
  return [...formats].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, 'es', { sensitivity: 'base' }),
  );
}

export function toBenefitFormatList(dtos: readonly BenefitFormatDto[]): readonly BenefitFormat[] {
  return sortBenefitFormats(dtos.map(toBenefitFormat));
}

export function toCreateBenefitFormatRequestDto(
  input: SaveBenefitFormatInput,
): CreateBenefitFormatRequestDto {
  return {
    code: input.code,
    displayName: input.displayName.trim(),
    description: input.description.trim(),
    active: input.active,
  };
}

/** The format cannot change once registered, so the body leaves the code out. */
export function toUpdateBenefitFormatRequestDto(
  input: SaveBenefitFormatInput,
): UpdateBenefitFormatRequestDto {
  return {
    displayName: input.displayName.trim(),
    description: input.description.trim(),
    active: input.active,
  };
}
