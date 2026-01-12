import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ISubTaskRepository } from '../../../../domain/repositories/subtask.repository.interface';
import { SubTask } from '../../../../domain/entities/subtask.entity';
import { SubTaskOrmEntity } from '../entities/subtask.orm-entity';
import { SubTaskMapper } from '../mappers/subtask.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class SubTaskRepository implements ISubTaskRepository {
  constructor(
    @InjectRepository(SubTaskOrmEntity)
    private readonly repository: Repository<SubTaskOrmEntity>,
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

  async save(subTask: SubTask): Promise<SubTask> {
    const ormEntity = SubTaskMapper.toPersistence(subTask);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return SubTaskMapper.toDomain(saved);
  }

  async findById(id: string): Promise<SubTask | null> {
    const ormEntity = await this.createTenantQueryBuilder('subtask')
      .andWhere('subtask.id = :id', { id })
      .getOne();
    return ormEntity ? SubTaskMapper.toDomain(ormEntity) : null;
  }

  async findByParentId(parentId: string): Promise<SubTask[]> {
    const ormEntities = await this.createTenantQueryBuilder('subtask')
      .andWhere('subtask.parentId = :parentId', { parentId })
      .orderBy('subtask.createdAt', 'ASC')
      .getMany();
    return ormEntities.map((entity) => SubTaskMapper.toDomain(entity));
  }

  async update(subTask: SubTask): Promise<SubTask> {
    const ormEntity = SubTaskMapper.toPersistence(subTask);
    await this.repository.save(ormEntity);
    return subTask;
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('subtask')
      .delete()
      .andWhere('subtask.id = :id', { id })
      .execute();
  }
}
