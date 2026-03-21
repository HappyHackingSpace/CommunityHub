import { SocialPost } from '../../../../domain/entities/social-post.entity';
import { PostContent } from '../../../../domain/value-objects/post-content.vo';
import { SocialPostOrmEntity } from '../entities/social-post.orm-entity';

export class SocialPostMapper {
  public static toDomain(raw: SocialPostOrmEntity): SocialPost {
    const content = PostContent.create(raw.content);
    return SocialPost.restore(raw.id, {
      tenantId: raw.tenantId,
      authorId: raw.authorId,
      content,
      imageUrls: raw.imageUrls || undefined,
      likesCount: raw.likesCount,
      commentsCount: raw.commentsCount,
      status: raw.status,
      likedBy: raw.likedBy || [],
    }, raw.createdAt, raw.updatedAt);
  }

  public static toPersistence(entity: SocialPost): SocialPostOrmEntity {
    const orm = new SocialPostOrmEntity();
    orm.id = entity.id;
    orm.tenantId = entity.tenantId;
    orm.authorId = entity.authorId;
    orm.content = entity.content.value;
    orm.imageUrls = entity.imageUrls || null;
    orm.likesCount = entity.likesCount;
    orm.commentsCount = entity.commentsCount;
    orm.status = entity.status;
    orm.likedBy = entity.likedBy;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
