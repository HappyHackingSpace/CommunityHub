export class MentorAssignedEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly mentorId: string,
    public readonly assigneeId: string | undefined,
  ) {}
}
