// src/modules/tasks/domain/events/task-status-changed.event.ts
import { TaskStatus } from '../enums/task-status.enum';

export class TaskStatusChangedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus,
    public readonly changedBy: string,
    public readonly assigneeId?: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
