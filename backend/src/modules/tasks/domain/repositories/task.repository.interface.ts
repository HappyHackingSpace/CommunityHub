import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';

export interface SearchTasksOptions {
  search?: string;
  status?: TaskStatus;
  tagIds?: string[];
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ITaskRepository {
  save(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findPublicTasks(): Promise<Task[]>;
  findByAssigneeId(assigneeId: string, status?: TaskStatus): Promise<Task[]>;
  findByAssignerId(assignerId: string, status?: TaskStatus): Promise<Task[]>;
  searchPublicTasks(options: SearchTasksOptions): Promise<PaginatedResult<Task>>;
  searchAssignedToMeTasks(
    userId: string,
    options: SearchTasksOptions,
  ): Promise<PaginatedResult<Task>>;
  searchAssignedByMeTasks(
    userId: string,
    options: SearchTasksOptions,
  ): Promise<PaginatedResult<Task>>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findByIdWithRelations(id: string): Promise<Task | null>;
  countByClubId(clubId: string, status?: TaskStatus): Promise<number>;
}
