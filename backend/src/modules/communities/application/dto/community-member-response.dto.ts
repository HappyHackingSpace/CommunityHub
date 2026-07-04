import { CommunityMemberStatus } from 'src/modules/communities/domain/enums/community-member-status.enum';

export class CommunityMemberResponseDto {
  id: string;
  communityId: string;
  userId: string;
  status: CommunityMemberStatus;
  appliedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
