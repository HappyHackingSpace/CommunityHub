import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PostStatus } from '../../../../domain/enums/post-status.enum';

@Entity('social_posts')
@Index(['authorId', 'createdAt'])
@Index(['status', 'createdAt'])
export class SocialPostOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('uuid', { name: 'tenant_id', nullable: true })
  @Index()
  tenantId: string | null;

  @Column('varchar')
  authorId: string;

  @Column('text')
  content: string;

  @Column('text', { array: true, nullable: true })
  imageUrls: string[] | null;

  @Column('int', { default: 0 })
  likesCount: number;

  @Column('text', { array: true, default: [] })
  likedBy: string[];

  @Column('int', { default: 0 })
  commentsCount: number;

  @Column('enum', { enum: PostStatus, default: PostStatus.PUBLISHED })
  status: PostStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
