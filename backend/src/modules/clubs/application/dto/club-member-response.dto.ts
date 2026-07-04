import { MembershipStatus } from 'src/modules/clubs/domain/enums/membership-status.enum';

export class ClubMemberResponseDto {
  id: string;
  clubId: string;
  userId: string;
  roleId: string;
  status: MembershipStatus;
  joinedAt?: Date;
  appliedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
