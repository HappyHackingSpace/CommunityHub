import { ActivityLog } from '../../../../domain/entities/activity-log.entity';
import { ActivityLogOrmEntity } from '../entities/activity-log.orm-entity';

export class ActivityLogMapper {
  static toPersistence(log: ActivityLog): ActivityLogOrmEntity {
    const ormEntity = new ActivityLogOrmEntity();
    ormEntity.id = log.id;
    ormEntity.taskId = log.taskId;
    ormEntity.userId = log.userId;
    ormEntity.action = log.action;
    ormEntity.details = log.details;
    ormEntity.createdAt = log.createdAt;
    ormEntity.updatedAt = log.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: ActivityLogOrmEntity): ActivityLog {
    return ActivityLog.restore(
      ormEntity.id,
      {
        taskId: ormEntity.taskId,
        userId: ormEntity.userId,
        action: ormEntity.action,
        details: ormEntity.details,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
