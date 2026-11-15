import { RedemptionStatusDto } from '../../profile/types/profile.dto';

const CLOSED_REDEMPTION_TITLES: Record<Exclude<RedemptionStatusDto, 'ACTIVE'>, string> = {
  USED: 'Este canje ya fue usado',
  EXPIRED: 'Este canje está vencido',
  CANCELLED: 'Este canje fue cancelado',
};

export function toClosedRedemptionTitle(status: Exclude<RedemptionStatusDto, 'ACTIVE'>): string {
  return CLOSED_REDEMPTION_TITLES[status];
}
