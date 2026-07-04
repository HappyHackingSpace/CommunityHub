import { ActivityFeedItem } from '../../../../domain/entities/activity-feed-item.entity';
import { ActivityMetadata } from '../../../../domain/value-objects/activity-metadata.vo';
import { ActivityFeedItemOrmEntity } from '../entities/activity-feed-item.orm-entity';

export class ActivityFeedItemMapper {
  public static toDomain(raw: ActivityFeedItemOrmEntity): ActivityFeedItem {
    const metadata = ActivityMetadata.create(raw.metadata);
    return ActivityFeedItem.restore(raw.id, {
      tenantId: raw.tenantId,
      userId: raw.userId,
      activityType: raw.activityType,
      metadata,
    }, raw.createdAt, raw.updatedAt);
  }

  public static toPersistence(entity: ActivityFeedItem): ActivityFeedItemOrmEntity {
    const orm = new ActivityFeedItemOrmEntity();
    orm.id = entity.id;
    orm.tenantId = entity.tenantId;
    orm.userId = entity.userId;
    orm.activityType = entity.activityType;
    orm.metadata = entity.metadata.toObject();
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
