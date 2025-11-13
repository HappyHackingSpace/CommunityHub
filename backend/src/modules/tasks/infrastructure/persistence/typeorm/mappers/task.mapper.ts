import { Task } from '../../../../domain/entities/task.entity';
import { TaskOrmEntity } from '../entities/task.orm-entity';
import { TaskTitle } from '../../../../domain/value-objects/task-title.vo';
import { TaskDescription } from '../../../../domain/value-objects/task-description.vo';
import { TaskPriority } from '../../../../domain/value-objects/task-priority.vo';

export class TaskMapper {
  static toPersistence(task: Task): TaskOrmEntity {
    const ormEntity = new TaskOrmEntity();
    ormEntity.id = task.id;
    ormEntity.title = task.title.value;
    ormEntity.description = task.description?.value;
    ormEntity.status = task.status;
    ormEntity.visibility = task.visibility;
    ormEntity.assignerId = task.assignerId;
    ormEntity.assigneeId = task.assigneeId;
    ormEntity.dueDate = task.dueDate;
    ormEntity.priority = task.priority.getValue();
    ormEntity.estimatedTime = task.estimatedTime;
    ormEntity.points = task.points;
    ormEntity.isRecurring = task.isRecurring;
    ormEntity.recurringSchedule = task.recurringSchedule;
    ormEntity.requiredSkills = task.requiredSkills;
    ormEntity.mentorId = task.mentorId;
    ormEntity.createdAt = task.createdAt;
    ormEntity.updatedAt = task.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: TaskOrmEntity): Task {
    return Task.restore(
      ormEntity.id,
      {
        title: TaskTitle.create(ormEntity.title),
        description: ormEntity.description
          ? TaskDescription.create(ormEntity.description)
          : undefined,
        status: ormEntity.status,
        visibility: ormEntity.visibility,
        assignerId: ormEntity.assignerId,
        assigneeId: ormEntity.assigneeId,
        dueDate: ormEntity.dueDate,
        priority: TaskPriority.create(ormEntity.priority),
        estimatedTime: ormEntity.estimatedTime,
        points: ormEntity.points,
        isRecurring: ormEntity.isRecurring,
        recurringSchedule: ormEntity.recurringSchedule,
        requiredSkills: ormEntity.requiredSkills,
        mentorId: ormEntity.mentorId,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
