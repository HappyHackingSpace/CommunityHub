import { BaseEntity } from 'src/shared/domain/base-entity';
import { CommentContent } from '../value-objects/comment-content.vo';
import { v4 as uuidv4 } from 'uuid';

interface CommentProps {
  taskId: string;
  userId: string;
  content: CommentContent;
}

export class Comment extends BaseEntity {
  private props: CommentProps;

  private constructor(
    id: string,
    props: CommentProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get taskId(): string {
    return this.props.taskId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get content(): CommentContent {
    return this.props.content;
  }

  // Static factory method for creation
  public static create(props: {
    taskId: string;
    userId: string;
    content: string;
  }): Comment {
    const commentId = uuidv4();
    return new Comment(commentId, {
      taskId: props.taskId,
      userId: props.userId,
      content: CommentContent.create(props.content),
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: CommentProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Comment {
    return new Comment(id, props, createdAt, updatedAt);
  }
}
