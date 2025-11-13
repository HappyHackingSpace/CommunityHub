import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFeedQuery } from './get-feed.query';
import type { IActivityFeedItemRepository } from 'src/modules/activity-feed/domain/repositories/activity-feed-item.repository.interface';

export interface FeedItemDto {
  id: string;
  userId: string;
  activityType: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

@QueryHandler(GetFeedQuery)
export class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
  constructor(
    @Inject('IActivityFeedItemRepository')
    private readonly repository: IActivityFeedItemRepository,
  ) {}

  async execute(query: GetFeedQuery): Promise<{ items: FeedItemDto[]; total: number }> {
    let items;
    let total;

    if (query.userId) {
      items = await this.repository.findByUserId(query.userId, query.limit, query.offset);
      total = await this.repository.countByUserId(query.userId);
    } else if (query.activityType) {
      items = await this.repository.findByActivityType(query.activityType, query.limit, query.offset);
      total = await this.repository.countAll();
    } else {
      items = await this.repository.findAll(query.limit, query.offset);
      total = await this.repository.countAll();
    }

    return {
      items: items.map(item => ({
        id: item.id,
        userId: item.userId,
        activityType: item.activityType,
        metadata: item.metadata.toObject(),
        createdAt: item.createdAt,
      })),
      total,
    };
  }
}
