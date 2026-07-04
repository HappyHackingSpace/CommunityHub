export class UpdateMeetingNoteCommand {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
    public readonly content?: string,
    public readonly isActionItem?: boolean,
    public readonly assignedToId?: string,
    public readonly dueDate?: Date,
  ) {}
}
