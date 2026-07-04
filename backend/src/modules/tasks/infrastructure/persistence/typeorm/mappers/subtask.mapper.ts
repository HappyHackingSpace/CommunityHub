import { SubTask } from '../../../../domain/entities/subtask.entity';
import { SubTaskOrmEntity } from '../entities/subtask.orm-entity';

export class SubTaskMapper {
  static toPersistence(subTask: SubTask): SubTaskOrmEntity {
    const ormEntity = new SubTaskOrmEntity();
    ormEntity.id = subTask.id;
    ormEntity.parentId = subTask.parentId;
    ormEntity.title = subTask.title;
    ormEntity.status = subTask.status;
    ormEntity.createdAt = subTask.createdAt;
    ormEntity.updatedAt = subTask.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: SubTaskOrmEntity): SubTask {
    return SubTask.restore(
      ormEntity.id,
      {
        parentId: ormEntity.parentId,
        title: ormEntity.title,
        status: ormEntity.status,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
