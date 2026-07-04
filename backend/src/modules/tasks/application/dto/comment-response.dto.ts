import { Comment } from '../../domain/entities/comment.entity';

export class CommentResponseDto {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      content: comment.content.value,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
