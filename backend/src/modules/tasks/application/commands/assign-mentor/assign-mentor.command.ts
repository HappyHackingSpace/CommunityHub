export class AssignMentorCommand {
  constructor(
    public readonly taskId: string,
    public readonly mentorId: string,
    public readonly assignedBy: string,
  ) {}
}
