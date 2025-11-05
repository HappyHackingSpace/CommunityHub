import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IActivityLogRepository } from '../../../../domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '../../../../domain/entities/activity-log.entity';
import { ActivityLogOrmEntity } from '../entities/activity-log.orm-entity';
import { ActivityLogMapper } from '../mappers/activity-log.mapper';

@Injectable()
export class ActivityLogRepository implements IActivityLogRepository {
  constructor(
    @InjectRepository(ActivityLogOrmEntity)
    private readonly repository: Repository<ActivityLogOrmEntity>,
  ) {}

  async save(log: ActivityLog): Promise<ActivityLog> {
    const ormEntity = ActivityLogMapper.toPersistence(log);
    const saved = await this.repository.save(ormEntity);
    return ActivityLogMapper.toDomain(saved);
  }

  async findByTaskId(taskId: string): Promise<ActivityLog[]> {
    const ormEntities = await this.repository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => ActivityLogMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
