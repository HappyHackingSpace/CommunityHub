export class CreateMeetingNoteCommand {
  constructor(
    public readonly meetingId: string,
    public readonly creatorId: string,
    public readonly content: string,
    public readonly isActionItem: boolean,
    public readonly assignedToId?: string,
    public readonly dueDate?: Date,
  ) {}
}
