import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { ClsService } from 'nestjs-cls';
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
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private repository: Repository<TaskOrmEntity>,
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

  async save(task: Task): Promise<Task> {
    const ormEntity = TaskMapper.toPersistence(task);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return TaskMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Task | null> {
    const ormEntity = await this.createTenantQueryBuilder('task')
      .andWhere('task.id = :id', { id })
      .getOne();
    return ormEntity ? TaskMapper.toDomain(ormEntity) : null;
  }

  async findByIdWithRelations(id: string): Promise<Task | null> {
    const ormEntity = await this.createTenantQueryBuilder('task')
      .andWhere('task.id = :id', { id })
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('task.activityLogs', 'activityLogs')
      .leftJoinAndSelect('task.subTasks', 'subTasks')
      .leftJoinAndSelect('task.tags', 'tags')
      .getOne();
    return ormEntity ? TaskMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Task[]> {
    const ormEntities = await this.createTenantQueryBuilder('task')
      .orderBy('task.createdAt', 'DESC')
      .getMany();
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async findPublicTasks(): Promise<Task[]> {
    const ormEntities = await this.createTenantQueryBuilder('task')
      .andWhere('task.visibility = :visibility', {
        visibility: TaskVisibility.PUBLIC,
      })
      .leftJoinAndSelect('task.tags', 'tags')
      .orderBy('task.createdAt', 'DESC')
      .getMany();
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async findByAssigneeId(
    assigneeId: string,
    status?: TaskStatus,
  ): Promise<Task[]> {
    const qb = this.createTenantQueryBuilder('task')
      .andWhere('task.assigneeId = :assigneeId', { assigneeId })
      .leftJoinAndSelect('task.tags', 'tags');

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    const ormEntities = await qb.orderBy('task.createdAt', 'DESC').getMany();
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async findByAssignerId(
    assignerId: string,
    status?: TaskStatus,
  ): Promise<Task[]> {
    const qb = this.createTenantQueryBuilder('task')
      .andWhere('task.assignerId = :assignerId', { assignerId })
      .leftJoinAndSelect('task.tags', 'tags');

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    const ormEntities = await qb.orderBy('task.createdAt', 'DESC').getMany();
    return ormEntities.map((entity) => TaskMapper.toDomain(entity));
  }

  async update(task: Task): Promise<Task> {
    const ormEntity = TaskMapper.toPersistence(task);
    await this.repository.save(ormEntity);
    return task;
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('task')
      .delete()
      .andWhere('task.id = :id', { id })
      .execute();
  }

  async searchPublicTasks(
    options: SearchTasksOptions,
  ): Promise<PaginatedResult<Task>> {
    const queryBuilder = this.createTenantQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .andWhere('task.visibility = :visibility', {
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
    const queryBuilder = this.createTenantQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .andWhere('task.assigneeId = :userId', { userId });

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
    const queryBuilder = this.createTenantQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .andWhere('task.assignerId = :userId', { userId });

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
