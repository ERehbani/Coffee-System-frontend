export interface AdminClientDto {
  readonly externalId: string;
  readonly name: string | null;
  readonly lastName: string | null;
  readonly phone: string | null;
  readonly profilePhoto: string | null;
  readonly currentPoints: number | null;
  readonly historicalPoints: number | null;
  readonly tierExternalId: string | null;
  readonly tierName: string | null;
  readonly userExternalId: string;
  readonly state: boolean | null;
  readonly email: string | null;
  readonly creationDate: string | null;
}
