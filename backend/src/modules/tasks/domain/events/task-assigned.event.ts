// src/modules/tasks/domain/events/task-assigned.event.ts
export class TaskAssignedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly assignerId: string,
    public readonly assigneeId: string,
    public readonly dueDate?: Date,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
