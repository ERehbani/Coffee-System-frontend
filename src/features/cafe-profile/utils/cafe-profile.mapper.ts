import { CafeResponseDto, UpdateCafeRequestDto } from '../types/cafe-profile.dto';
import { CafeProfile, UpdateCafeProfileInput } from '../types/cafe-profile.model';

export function toCafeProfile(dto: CafeResponseDto): CafeProfile {
  return {
    id: dto.externalId,
    name: dto.name,
    address: dto.address,
    email: dto.email,
    phoneNumber: dto.phoneNumber ?? '',
    description: dto.description ?? '',
    isOpen: dto.state,
    schedule: dto.schedule ?? '',
    image: dto.image ?? '',
  };
}

export function toUpdateCafeRequestDto(input: UpdateCafeProfileInput): UpdateCafeRequestDto {
  return {
    address: input.address.trim(),
    phoneNumber: input.phoneNumber.trim(),
    description: input.description.trim(),
    schedule: input.schedule.trim(),
    image: input.image.trim(),
  };
}
