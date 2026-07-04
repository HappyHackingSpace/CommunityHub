export class DeleteMeetingNoteCommand {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
  ) {}
}
