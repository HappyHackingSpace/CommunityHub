import { Comment } from '../../../../domain/entities/comment.entity';
import { CommentOrmEntity } from '../entities/comment.orm-entity';
import { CommentContent } from '../../../../domain/value-objects/comment-content.vo';

export class CommentMapper {
  static toPersistence(comment: Comment): CommentOrmEntity {
    const ormEntity = new CommentOrmEntity();
    ormEntity.id = comment.id;
    ormEntity.taskId = comment.taskId;
    ormEntity.userId = comment.userId;
    ormEntity.content = comment.content.value;
    ormEntity.createdAt = comment.createdAt;
    ormEntity.updatedAt = comment.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: CommentOrmEntity): Comment {
    return Comment.restore(
      ormEntity.id,
      {
        taskId: ormEntity.taskId,
        userId: ormEntity.userId,
        content: CommentContent.create(ormEntity.content),
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
