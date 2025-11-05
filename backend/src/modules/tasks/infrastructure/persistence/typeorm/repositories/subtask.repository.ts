import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISubTaskRepository } from '../../../../domain/repositories/subtask.repository.interface';
import { SubTask } from '../../../../domain/entities/subtask.entity';
import { SubTaskOrmEntity } from '../entities/subtask.orm-entity';
import { SubTaskMapper } from '../mappers/subtask.mapper';

@Injectable()
export class SubTaskRepository implements ISubTaskRepository {
  constructor(
    @InjectRepository(SubTaskOrmEntity)
    private readonly repository: Repository<SubTaskOrmEntity>,
  ) {}

  async save(subTask: SubTask): Promise<SubTask> {
    const ormEntity = SubTaskMapper.toPersistence(subTask);
    const saved = await this.repository.save(ormEntity);
    return SubTaskMapper.toDomain(saved);
  }

  async findById(id: string): Promise<SubTask | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? SubTaskMapper.toDomain(ormEntity) : null;
  }

  async findByParentId(parentId: string): Promise<SubTask[]> {
    const ormEntities = await this.repository.find({
      where: { parentId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map((entity) => SubTaskMapper.toDomain(entity));
  }

  async update(subTask: SubTask): Promise<SubTask> {
    const ormEntity = SubTaskMapper.toPersistence(subTask);
    await this.repository.save(ormEntity);
    return subTask;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
