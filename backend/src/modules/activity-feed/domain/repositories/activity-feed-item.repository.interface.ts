import { ActivityFeedItem } from '../entities/activity-feed-item.entity';
import { ActivityType } from '../enums/activity-type.enum';

export interface IActivityFeedItemRepository {
  save(item: ActivityFeedItem): Promise<void>;
  findById(id: string): Promise<ActivityFeedItem | null>;
  findByUserId(userId: string, limit: number, offset: number): Promise<ActivityFeedItem[]>;
  findByActivityType(type: ActivityType, limit: number, offset: number): Promise<ActivityFeedItem[]>;
  findAll(limit: number, offset: number): Promise<ActivityFeedItem[]>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
  countAll(): Promise<number>;
}
