export class TaskHandoverRequestedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly currentAssigneeId: string,
    public readonly reason: string,
  ) {}
}
