import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { GetSocialPostsQuery } from './get-social-posts.query';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';
import type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';

export interface SocialPostDto {
  id: string;
  authorId: string;
  content: string;
  imageUrls?: string[];
  likesCount: number;
  commentsCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  likedBy: string[];
}

@QueryHandler(GetSocialPostsQuery)
export class GetSocialPostsHandler implements IQueryHandler<GetSocialPostsQuery> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetSocialPostsQuery): Promise<{ items: SocialPostDto[]; total: number }> {
    const tenantId = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY)?.tenantId;
    let items;
    let total;

    if (query.authorId) {
      items = await this.repository.findByAuthorId(query.authorId, query.limit, query.offset);
      total = await this.repository.countByAuthorId(query.authorId);
    } else if (query.status) {
      items = await this.repository.findByStatus(query.status, query.limit, query.offset);
      total = await this.repository.countByStatus(query.status);
    } else {
      items = await this.repository.findAll(query.limit, query.offset);
      
      if (tenantId) {
        items = items.filter(post => (post as any).tenantId === tenantId);
        total = items.length;
      } else {
        total = await this.repository.countAll();
      }
    }

    return {
      items: items.map(post => ({
        id: post.id,
        authorId: post.authorId,
        content: post.content.value,
        imageUrls: post.imageUrls,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likedBy: (post as any).likedBy || [],
      })),
      total,
    };
  }
}
