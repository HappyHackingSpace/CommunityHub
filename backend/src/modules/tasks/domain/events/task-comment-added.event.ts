// src/modules/tasks/domain/events/task-comment-added.event.ts
export class TaskCommentAddedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly commentId: string,
    public readonly authorId: string,
    public readonly content: string,
    public readonly taskOwnerId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
