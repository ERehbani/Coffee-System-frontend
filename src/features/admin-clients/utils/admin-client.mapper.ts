import { AdminClientDto } from '../types/admin-client.dto';
import { AdminClient } from '../types/admin-client.model';

const NAMELESS_CLIENT = 'Cliente sin nombre';

export function toAdminClient(dto: AdminClientDto): AdminClient {
  const currentPoints = dto.currentPoints ?? 0;
  const historicalPoints = dto.historicalPoints ?? 0;
  const displayName = fullNameOf(dto) ?? dto.email ?? NAMELESS_CLIENT;

  return {
    id: dto.externalId,
    displayName,
    initials: initialsOf(displayName),
    firstName: blankToNull(dto.name),
    lastName: blankToNull(dto.lastName),
    email: dto.email,
    phone: blankToNull(dto.phone),
    photoUrl: blankToNull(dto.profilePhoto),
    currentPoints,
    historicalPoints,
    spentPoints: Math.max(0, historicalPoints - currentPoints),
    tierName: dto.tierName,
    status: dto.state ? 'active' : 'inactive',
    createdAt: dto.creationDate ? new Date(dto.creationDate) : null,
  };
}

export function toAdminClientList(dtos: readonly AdminClientDto[]): readonly AdminClient[] {
  return dtos.map(toAdminClient);
}

function fullNameOf(dto: AdminClientDto): string | null {
  const parts = [blankToNull(dto.name), blankToNull(dto.lastName)].filter((part) => part !== null);
  return parts.length > 0 ? parts.join(' ') : null;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function blankToNull(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
