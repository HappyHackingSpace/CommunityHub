import { IsUUID } from 'class-validator';

export class MembershipApplicationDto {
  @IsUUID()
  clubId: string;
}
