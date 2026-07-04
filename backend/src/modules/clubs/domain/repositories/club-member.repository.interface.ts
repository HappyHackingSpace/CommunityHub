import { ClubMember } from '../entities/club-member.entity';
import { MembershipStatus } from '../enums/membership-status.enum';

export interface IClubMemberRepository {
  create(member: ClubMember): Promise<void>;
  findById(id: string): Promise<ClubMember | null>;
  findByClubAndUser(clubId: string, userId: string): Promise<ClubMember | null>;
  update(member: ClubMember): Promise<void>;
  delete(id: string): Promise<void>;
  findMembersByClub(clubId: string): Promise<ClubMember[]>;
  findMembersByClubAndStatus(
    clubId: string,
    status: MembershipStatus,
  ): Promise<ClubMember[]>;
  findActiveMembersByClub(clubId: string): Promise<ClubMember[]>;
  findPendingApplicationsByClub(clubId: string): Promise<ClubMember[]>;
  findUserClubs(userId: string): Promise<ClubMember[]>;
}
