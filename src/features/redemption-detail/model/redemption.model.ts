import { RedemptionDto } from '../../profile/types/profile.dto';

export interface Redemption extends RedemptionDto {
  description: string | null;
  expiresAt: string | null;
  conditions: string | null;
}
