import { Badge } from '../../../../domain/entities/badge.entity';
import { BadgeOrmEntity } from '../entities/badge.orm-entity';

export class BadgeMapper {
  static toPersistence(badge: Badge): BadgeOrmEntity {
    const ormEntity = new BadgeOrmEntity();
    ormEntity.id = badge.id;
    ormEntity.userId = badge.userId;
    ormEntity.type = badge.type;
    ormEntity.name = badge.name;
    ormEntity.description = badge.description;
    ormEntity.points = badge.points;
    ormEntity.metadata = badge.metadata;
    ormEntity.createdAt = badge.createdAt;
    ormEntity.updatedAt = badge.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: BadgeOrmEntity): Badge {
    return Badge.restore(
      ormEntity.id,
      {
        userId: ormEntity.userId,
        type: ormEntity.type,
        name: ormEntity.name,
        description: ormEntity.description,
        points: ormEntity.points,
        metadata: ormEntity.metadata,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
