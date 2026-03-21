import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { IActivityLogRepository } from '../../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../../domain/entities/activity-log.entity';
import { ActivityLogOrmEntity } from '../entities/activity-log.orm-entity';
import { ActivityLogMapper } from '../mappers/activity-log.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class ActivityLogRepository implements IActivityLogRepository {
  constructor(
    @InjectRepository(ActivityLogOrmEntity)
    private readonly repository: Repository<ActivityLogOrmEntity>,
    private cls: ClsService,
  ) {}

  protected getTenantId(): string {
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

  async save(log: ActivityLog): Promise<ActivityLog> {
    const ormEntity = ActivityLogMapper.toPersistence(log);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return ActivityLogMapper.toDomain(saved);
  }

  async findByTaskId(taskId: string): Promise<ActivityLog[]> {
    const ormEntities = await this.createTenantQueryBuilder('activityLog')
      .andWhere('activityLog.taskId = :taskId', { taskId })
      .orderBy('activityLog.createdAt', 'DESC')
      .getMany();
    return ormEntities.map((entity) => ActivityLogMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('activityLog')
      .delete()
      .andWhere('activityLog.id = :id', { id })
      .execute();
  }
}
