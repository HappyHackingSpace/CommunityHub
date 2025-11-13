import { TaskDependency } from '../entities/task-dependency.entity';

export interface ITaskDependencyRepository {
  save(dependency: TaskDependency): Promise<TaskDependency>;
  findById(id: string): Promise<TaskDependency | null>;
  findByTaskId(taskId: string): Promise<TaskDependency[]>;
  findDependentsOf(taskId: string): Promise<TaskDependency[]>;
  delete(id: string): Promise<void>;
  hasDependency(taskId: string, dependsOnTaskId: string): Promise<boolean>;
}
