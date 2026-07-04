import { Comment } from '../entities/comment.entity';

export interface ICommentRepository {
  save(comment: Comment): Promise<Comment>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  delete(id: string): Promise<void>;
}
