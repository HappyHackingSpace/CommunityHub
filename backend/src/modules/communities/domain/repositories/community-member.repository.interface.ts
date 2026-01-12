import { CommunityMember } from '../entities/community-member.entity';
import { CommunityMemberStatus } from '../enums/community-member-status.enum';

export interface ICommunityMemberRepository {
  create(member: CommunityMember): Promise<void>;
  findById(id: string): Promise<CommunityMember | null>;
  findByCommunityAndUser(communityId: string, userId: string): Promise<CommunityMember | null>;
  findByUserId(userId: string): Promise<CommunityMember[]>;
  findByCommunityId(communityId: string): Promise<CommunityMember[]>;
  findByStatus(communityId: string, status: CommunityMemberStatus): Promise<CommunityMember[]>;
  findActiveMembershipsByUserId(userId: string): Promise<CommunityMember[]>;
  findUserTenantsWithCommunityInfo(userId: string): Promise<Array<{ tenantId: number; communityId: string; communityName: string }>>;
  update(member: CommunityMember): Promise<void>;
  delete(id: string): Promise<void>;
}
