import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IAssignmentHistoryRepository } from '../../../../domain/repositories/assignment-history.repository.interface';
import { AssignmentHistory } from '../../../../domain/entities/assignment-history.entity';
import { AssignmentHistoryOrmEntity } from '../entities/assignment-history.orm-entity';
import { AssignmentHistoryMapper } from '../mappers/assignment-history.mapper';

@Injectable()
export class AssignmentHistoryRepository
  implements IAssignmentHistoryRepository
{
  constructor(
    @InjectRepository(AssignmentHistoryOrmEntity)
    private readonly repository: Repository<AssignmentHistoryOrmEntity>,
  ) {}

  async save(history: AssignmentHistory): Promise<AssignmentHistory> {
    const ormEntity = AssignmentHistoryMapper.toPersistence(history);
    const saved = await this.repository.save(ormEntity);
    return AssignmentHistoryMapper.toDomain(saved);
  }

  async findByTaskId(taskId: string): Promise<AssignmentHistory[]> {
    const ormEntities = await this.repository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) =>
      AssignmentHistoryMapper.toDomain(entity),
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
