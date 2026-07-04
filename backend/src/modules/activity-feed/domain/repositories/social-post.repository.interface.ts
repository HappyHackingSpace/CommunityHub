import { SocialPost } from '../entities/social-post.entity';
import { PostStatus } from '../enums/post-status.enum';

export interface ISocialPostRepository {
  save(post: SocialPost): Promise<void>;
  findById(id: string): Promise<SocialPost | null>;
  findByAuthorId(authorId: string, limit: number, offset: number): Promise<SocialPost[]>;
  findByStatus(status: PostStatus, limit: number, offset: number): Promise<SocialPost[]>;
  findAll(limit: number, offset: number): Promise<SocialPost[]>;
  delete(id: string): Promise<void>;
  countByAuthorId(authorId: string): Promise<number>;
  countByStatus(status: PostStatus): Promise<number>;
  countAll(): Promise<number>;
}
