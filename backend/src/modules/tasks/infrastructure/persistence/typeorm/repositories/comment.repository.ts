import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommentRepository } from '../../../../domain/repositories/comment.repository.interface';
import { Comment } from '../../../../domain/entities/comment.entity';
import { CommentOrmEntity } from '../entities/comment.orm-entity';
import { CommentMapper } from '../mappers/comment.mapper';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly repository: Repository<CommentOrmEntity>,
  ) {}

  async save(comment: Comment): Promise<Comment> {
    const ormEntity = CommentMapper.toPersistence(comment);
    const saved = await this.repository.save(ormEntity);
    return CommentMapper.toDomain(saved);
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const ormEntities = await this.repository.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map((entity) => CommentMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
