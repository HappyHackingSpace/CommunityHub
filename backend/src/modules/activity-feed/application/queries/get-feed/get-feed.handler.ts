import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { GetFeedQuery } from './get-feed.query';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';
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
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetFeedQuery): Promise<{ items: FeedItemDto[]; total: number }> {
    const tenantId = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY)?.tenantId;
    let items;
    let total;

    if (query.userId) {
      items = await this.repository.findByUserId(query.userId, query.limit, query.offset);
      total = await this.repository.countByUserId(query.userId);
    } else if (query.activityType) {
      items = await this.repository.findByActivityType(query.activityType, query.limit, query.offset);
      total = await this.repository.countAll();
    } else {
      // Filter by tenant if available
      items = await this.repository.findAll(query.limit, query.offset);
      
      if (tenantId) {
        items = items.filter(item => (item as any).tenantId === tenantId);
        total = items.length;
      } else {
        total = await this.repository.countAll();
      }
    }

    return {
      items: items.map(item => ({
        id: item.id,
        userId: item.userId,
        activityType: item.activityType,
        metadata: (item.metadata as any).toObject ? (item.metadata as any).toObject() : item.metadata,
        createdAt: item.createdAt,
      })),
      total,
    };
  }
}
