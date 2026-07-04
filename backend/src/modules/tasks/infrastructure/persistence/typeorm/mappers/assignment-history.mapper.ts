import { AssignmentHistory } from '../../../../domain/entities/assignment-history.entity';
import { AssignmentHistoryOrmEntity } from '../entities/assignment-history.orm-entity';

export class AssignmentHistoryMapper {
  static toPersistence(
    history: AssignmentHistory,
  ): AssignmentHistoryOrmEntity {
    const ormEntity = new AssignmentHistoryOrmEntity();
    ormEntity.id = history.id;
    ormEntity.taskId = history.taskId;
    ormEntity.assignedBy = history.assignedBy;
    ormEntity.assignedTo = history.assignedTo;
    ormEntity.previousAssignee = history.previousAssignee;
    ormEntity.createdAt = history.createdAt;
    ormEntity.updatedAt = history.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: AssignmentHistoryOrmEntity): AssignmentHistory {
    return AssignmentHistory.restore(
      ormEntity.id,
      {
        taskId: ormEntity.taskId,
        assignedBy: ormEntity.assignedBy,
        assignedTo: ormEntity.assignedTo,
        previousAssignee: ormEntity.previousAssignee,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
