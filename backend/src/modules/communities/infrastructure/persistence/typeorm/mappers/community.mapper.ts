import { Community } from 'src/modules/communities/domain/entities/community.entity';
import { CommunityName } from 'src/modules/communities/domain/value-objects/community-name.vo';
import { CommunityDescription } from 'src/modules/communities/domain/value-objects/community-description.vo';
import { CommunityOrmEntity } from '../entities/community.orm-entity';
import { CommunityVisibility } from 'src/modules/communities/domain/enums/community-visibility.enum';

export class CommunityMapper {
  static toDomain(raw: CommunityOrmEntity): Community {
    console.log('CommunityMapper.toDomain - raw.name type:', typeof raw.name, 'value:', raw.name);
    return Community.restore(
      raw.id,
      {
        name: CommunityName.create(raw.name),
        description: CommunityDescription.create(raw.description),
        visibility: raw.visibility as CommunityVisibility,
        founderId: raw.founderId,
        logoUrl: raw.logoUrl,
        websiteUrl: raw.websiteUrl,
        tenantId: raw.tenantId || undefined,
      },
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(community: Community): CommunityOrmEntity {
    const ormEntity = new CommunityOrmEntity();
    ormEntity.id = community.id;
    ormEntity.name = community.name.toString();
    ormEntity.description = community.description.toString();
    ormEntity.visibility = community.visibility;
    ormEntity.founderId = community.founderId;
    ormEntity.logoUrl = community.logoUrl;
    ormEntity.websiteUrl = community.websiteUrl;
    ormEntity.tenantId = community.tenantId;
    ormEntity.createdAt = community.createdAt;
    ormEntity.updatedAt = community.updatedAt;
    return ormEntity;
  }
}
