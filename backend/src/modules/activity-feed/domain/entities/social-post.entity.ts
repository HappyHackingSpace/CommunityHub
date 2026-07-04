import { BaseEntity } from '../../../../shared/domain/base-entity';
import { PostContent } from '../value-objects/post-content.vo';
import { PostStatus } from '../enums/post-status.enum';

interface SocialPostProps {
  tenantId: string | null;
  authorId: string;
  content: PostContent;
  imageUrls?: string[];
  likesCount: number;
  commentsCount: number;
  status: PostStatus;
  likedBy: string[];
}

export class SocialPost extends BaseEntity {
  private props: SocialPostProps;

  private constructor(
    id: string,
    props: SocialPostProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get tenantId(): string | null {
    return this.props.tenantId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get content(): PostContent {
    return this.props.content;
  }

  get imageUrls(): string[] | undefined {
    return this.props.imageUrls ? [...this.props.imageUrls] : undefined;
  }

  get likesCount(): number {
    return this.props.likesCount;
  }

  get commentsCount(): number {
    return this.props.commentsCount;
  }

  get status(): PostStatus {
    return this.props.status;
  }

  get likedBy(): string[] {
    return [...this.props.likedBy];
  }

  public static create(props: {
    tenantId: string | null;
    authorId: string;
    content: string;
    imageUrls?: string[];
  }): SocialPost {
    const id = this.generateId();
    return new SocialPost(id, {
      tenantId: props.tenantId,
      authorId: props.authorId,
      content: PostContent.create(props.content),
      imageUrls: props.imageUrls,
      likesCount: 0,
      commentsCount: 0,
      status: PostStatus.PUBLISHED,
      likedBy: [],
    });
  }

  public static restore(
    id: string,
    props: SocialPostProps,
    createdAt: Date,
    updatedAt?: Date,
  ): SocialPost {
    return new SocialPost(id, props, createdAt, updatedAt);
  }

  public updateContent(content: string): void {
    this.props.content = PostContent.create(content);
    this.updatedAt = new Date();
  }

  public like(userId: string): void {
    if (!this.props.likedBy.includes(userId)) {
      this.props.likedBy = [...this.props.likedBy, userId];
      this.props.likesCount = this.props.likedBy.length;
      this.updatedAt = new Date();
    }
  }

  public unlike(userId: string): void {
    const index = this.props.likedBy.indexOf(userId);
    if (index > -1) {
      const newLikedBy = [...this.props.likedBy];
      newLikedBy.splice(index, 1);
      this.props.likedBy = newLikedBy;
      this.props.likesCount = this.props.likedBy.length;
      this.updatedAt = new Date();
    }
  }

  public incrementComments(): void {
    this.props.commentsCount++;
    this.updatedAt = new Date();
  }

  public decrementComments(): void {
    if (this.props.commentsCount > 0) {
      this.props.commentsCount--;
      this.updatedAt = new Date();
    }
  }

  public hide(): void {
    this.props.status = PostStatus.HIDDEN;
    this.updatedAt = new Date();
  }

  public delete(): void {
    this.props.status = PostStatus.DELETED;
    this.updatedAt = new Date();
  }

  public flag(): void {
    this.props.status = PostStatus.FLAGGED;
    this.updatedAt = new Date();
  }

  public restore(): void {
    this.props.status = PostStatus.PUBLISHED;
    this.updatedAt = new Date();
  }

  private static generateId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
