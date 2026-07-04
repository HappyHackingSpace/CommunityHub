export class TaskCompletedEvent {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string | undefined,
    public readonly points: number | undefined,
    public readonly completedAt: Date,
  ) {}
}
