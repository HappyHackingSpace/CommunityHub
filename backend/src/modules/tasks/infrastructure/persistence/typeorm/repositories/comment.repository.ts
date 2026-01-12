import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ICommentRepository } from '../../../../domain/repositories/comment.repository.interface';
import { Comment } from '../../../../domain/entities/comment.entity';
import { CommentOrmEntity } from '../entities/comment.orm-entity';
import { CommentMapper } from '../mappers/comment.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly repository: Repository<CommentOrmEntity>,
    private cls: ClsService,
  ) {}

  protected getTenantId(): number {
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Tenant context is not set');
    }
    return tenantContext.tenantId;
  }

  protected createTenantQueryBuilder(alias: string) {
    const tenantId = this.getTenantId();
    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  async save(comment: Comment): Promise<Comment> {
    const ormEntity = CommentMapper.toPersistence(comment);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return CommentMapper.toDomain(saved);
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const ormEntities = await this.createTenantQueryBuilder('comment')
      .andWhere('comment.taskId = :taskId', { taskId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();
    return ormEntities.map((entity) => CommentMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('comment')
      .delete()
      .andWhere('comment.id = :id', { id })
      .execute();
  }
}
