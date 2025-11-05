import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import type {
  ITaskRepository,
  SearchTasksOptions,
  PaginatedResult,
} from '../../../../domain/repositories/task.repository.interface';
import { Task } from '../../../../domain/entities/task.entity';
import { TaskOrmEntity } from '../entities/task.orm-entity';
import { TaskMapper } from '../mappers/task.mapper';
import { TaskStatus } from '../../../../domain/enums/task-status.enum';
import { TaskVisibility } from '../../../../domain/enums/task-visibility.enum';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly repository: Repository<TaskOrmEntity>,
  ) {}

  async save(task: Task): Promise<Task> {
    const ormEntity = TaskMapper.toPersistence(task);
    const saved = await this.repository.save(ormEntity);
    return TaskMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Task | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? TaskMapper.toDomain(ormEntity) : null;
  }

  async findByIdWithRelations(id: string): Promise<Task | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['comments', 'activityLogs', 'subTasks', 'tags'],
    });
    return ormEntity ? TaskMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Task[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async findPublicTasks(): Promise<Task[]> {
    const ormEntities = await this.repository.find({
      where: { visibility: TaskVisibility.PUBLIC },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async findByAssigneeId(
    assigneeId: string,
    status?: TaskStatus,
  ): Promise<Task[]> {
    const where: any = { assigneeId };
    if (status) {
      where.status = status;
    }

    const ormEntities = await this.repository.find({
      where,
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async findByAssignerId(
    assignerId: string,
    status?: TaskStatus,
  ): Promise<Task[]> {
    const where: any = { assignerId };
    if (status) {
      where.status = status;
    }

    const ormEntities = await this.repository.find({
      where,
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async update(task: Task): Promise<Task> {
    const ormEntity = TaskMapper.toPersistence(task);
    await this.repository.save(ormEntity);
    return task;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async searchPublicTasks(
    options: SearchTasksOptions,
  ): Promise<PaginatedResult<Task>> {
    const queryBuilder = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .where('task.visibility = :visibility', {
        visibility: TaskVisibility.PUBLIC,
      });

    // Apply search filter
    if (options.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // Apply status filter
    if (options.status) {
      queryBuilder.andWhere('task.status = :status', { status: options.status });
    }

    // Apply tag filter
    if (options.tagIds && options.tagIds.length > 0) {
      queryBuilder.andWhere('tag.id IN (:...tagIds)', {
        tagIds: options.tagIds,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (options.page - 1) * options.limit;
    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(options.limit);

    const ormEntities = await queryBuilder.getMany();
    const tasks = ormEntities.map((entity) => TaskMapper.toDomain(entity));

    return { data: tasks, total };
  }

  async searchAssignedToMeTasks(
    userId: string,
    options: SearchTasksOptions,
  ): Promise<PaginatedResult<Task>> {
    const queryBuilder = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .where('task.assigneeId = :userId', { userId });

    // Apply search filter
    if (options.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // Apply status filter
    if (options.status) {
      queryBuilder.andWhere('task.status = :status', { status: options.status });
    }

    // Apply tag filter
    if (options.tagIds && options.tagIds.length > 0) {
      queryBuilder.andWhere('tag.id IN (:...tagIds)', {
        tagIds: options.tagIds,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (options.page - 1) * options.limit;
    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(options.limit);

    const ormEntities = await queryBuilder.getMany();
    const tasks = ormEntities.map((entity) => TaskMapper.toDomain(entity));

    return { data: tasks, total };
  }

  async searchAssignedByMeTasks(
    userId: string,
    options: SearchTasksOptions,
  ): Promise<PaginatedResult<Task>> {
    const queryBuilder = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .where('task.assignerId = :userId', { userId });

    // Apply search filter
    if (options.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // Apply status filter
    if (options.status) {
      queryBuilder.andWhere('task.status = :status', { status: options.status });
    }

    // Apply tag filter
    if (options.tagIds && options.tagIds.length > 0) {
      queryBuilder.andWhere('tag.id IN (:...tagIds)', {
        tagIds: options.tagIds,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (options.page - 1) * options.limit;
    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(options.limit);

    const ormEntities = await queryBuilder.getMany();
    const tasks = ormEntities.map((entity) => TaskMapper.toDomain(entity));

    return { data: tasks, total };
  }
}
