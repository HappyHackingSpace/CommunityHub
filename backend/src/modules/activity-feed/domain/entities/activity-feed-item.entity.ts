import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ActivityType } from '../enums/activity-type.enum';
import { ActivityMetadata } from '../value-objects/activity-metadata.vo';

interface ActivityFeedItemProps {
  userId: string;
  activityType: ActivityType;
  metadata: ActivityMetadata;
}

export class ActivityFeedItem extends BaseEntity {
  private props: ActivityFeedItemProps;

  private constructor(
    id: string,
    props: ActivityFeedItemProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get userId(): string {
    return this.props.userId;
  }

  get activityType(): ActivityType {
    return this.props.activityType;
  }

  get metadata(): ActivityMetadata {
    return this.props.metadata;
  }

  public static create(props: {
    userId: string;
    activityType: ActivityType;
    metadata: ActivityMetadata;
  }): ActivityFeedItem {
    const id = this.generateId();
    return new ActivityFeedItem(id, {
      userId: props.userId,
      activityType: props.activityType,
      metadata: props.metadata,
    });
  }

  public static restore(
    id: string,
    props: ActivityFeedItemProps,
    createdAt: Date,
    updatedAt?: Date,
  ): ActivityFeedItem {
    return new ActivityFeedItem(id, props, createdAt, updatedAt);
  }

  private static generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
