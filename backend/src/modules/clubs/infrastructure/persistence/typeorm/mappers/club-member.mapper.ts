import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import { MembershipStatus } from 'src/modules/clubs/domain/enums/membership-status.enum';
import { ClubMemberOrmEntity } from '../entities/club-member.orm-entity';

export class ClubMemberMapper {
  public static toDomain(raw: ClubMemberOrmEntity): ClubMember {
    return ClubMember.restore(
      raw.id,
      {
        clubId: raw.clubId,
        userId: raw.userId,
        roleId: raw.roleId,
        status: raw.status as MembershipStatus,
        joinedAt: raw.joinedAt,
        appliedAt: raw.appliedAt,
        approvedAt: raw.approvedAt,
        approvedBy: raw.approvedBy,
      },
      raw.createdAt,
      raw.updatedAt,
    );
  }

  public static toPersistence(member: ClubMember): Partial<ClubMemberOrmEntity> {
    return {
      id: member.id,
      clubId: member.clubId,
      userId: member.userId,
      roleId: member.roleId,
      status: member.status,
      joinedAt: member.joinedAt,
      appliedAt: member.appliedAt,
      approvedAt: member.approvedAt,
      approvedBy: member.approvedBy,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
