import { TaskDependency } from '../../../../domain/entities/task-dependency.entity';
import { TaskDependencyOrmEntity } from '../entities/task-dependency.orm-entity';

export class TaskDependencyMapper {
  static toPersistence(dependency: TaskDependency): TaskDependencyOrmEntity {
    const ormEntity = new TaskDependencyOrmEntity();
    ormEntity.id = dependency.id;
    ormEntity.taskId = dependency.taskId;
    ormEntity.dependsOnTaskId = dependency.dependsOnTaskId;
    ormEntity.createdAt = dependency.createdAt;
    ormEntity.updatedAt = dependency.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: TaskDependencyOrmEntity): TaskDependency {
    return TaskDependency.restore(
      ormEntity.id,
      {
        taskId: ormEntity.taskId,
        dependsOnTaskId: ormEntity.dependsOnTaskId,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
