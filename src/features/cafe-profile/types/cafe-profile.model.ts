export interface CafeProfile {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly isOpen: boolean;
  readonly schedule: string;
  readonly image: string;
}

export interface UpdateCafeProfileInput {
  readonly address: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly schedule: string;
  readonly image: string;
}
