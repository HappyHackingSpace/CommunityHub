import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';
import { CommunityMemberOrmEntity } from '../entities/community-member.orm-entity';
import { CommunityMemberStatus } from 'src/modules/communities/domain/enums/community-member-status.enum';

export class CommunityMemberMapper {
  static toDomain(raw: CommunityMemberOrmEntity): CommunityMember {
    return CommunityMember.restore(
      raw.id,
      {
        communityId: raw.communityId,
        userId: raw.userId,
        status: raw.status as CommunityMemberStatus,
        appliedAt: raw.appliedAt,
        approvedAt: raw.approvedAt,
        approvedBy: raw.approvedBy,
      },
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(member: CommunityMember): CommunityMemberOrmEntity {
    const ormEntity = new CommunityMemberOrmEntity();
    ormEntity.id = member.id;
    ormEntity.communityId = member.communityId;
    ormEntity.userId = member.userId;
    ormEntity.status = member.status;
    ormEntity.appliedAt = member.appliedAt;
    ormEntity.approvedAt = member.approvedAt;
    ormEntity.approvedBy = member.approvedBy;
    ormEntity.createdAt = member.createdAt;
    ormEntity.updatedAt = member.updatedAt;
    return ormEntity;
  }
}
