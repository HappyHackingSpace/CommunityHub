export class DueDateReminderEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly assigneeId: string | undefined,
    public readonly dueDate: Date,
    public readonly hoursUntilDue: number,
  ) {}
}
