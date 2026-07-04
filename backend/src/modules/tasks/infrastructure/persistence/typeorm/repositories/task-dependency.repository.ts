import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITaskDependencyRepository } from '../../../../domain/repositories/task-dependency.repository.interface';
import { TaskDependency } from '../../../../domain/entities/task-dependency.entity';
import { TaskDependencyOrmEntity } from '../entities/task-dependency.orm-entity';
import { TaskDependencyMapper } from '../mappers/task-dependency.mapper';

@Injectable()
export class TaskDependencyRepository implements ITaskDependencyRepository {
  constructor(
    @InjectRepository(TaskDependencyOrmEntity)
    private readonly repository: Repository<TaskDependencyOrmEntity>,
  ) {}

  async save(dependency: TaskDependency): Promise<TaskDependency> {
    const ormEntity = TaskDependencyMapper.toPersistence(dependency);
    const saved = await this.repository.save(ormEntity);
    return TaskDependencyMapper.toDomain(saved);
  }

  async findById(id: string): Promise<TaskDependency | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? TaskDependencyMapper.toDomain(ormEntity) : null;
  }

  async findByTaskId(taskId: string): Promise<TaskDependency[]> {
    const ormEntities = await this.repository.find({
      where: { taskId },
    });
    return ormEntities.map((entity) => TaskDependencyMapper.toDomain(entity));
  }

  async findDependentsOf(taskId: string): Promise<TaskDependency[]> {
    const ormEntities = await this.repository.find({
      where: { dependsOnTaskId: taskId },
    });
    return ormEntities.map((entity) => TaskDependencyMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async hasDependency(
    taskId: string,
    dependsOnTaskId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { taskId, dependsOnTaskId },
    });
    return count > 0;
  }
}
