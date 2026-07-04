export class ConvertNoteToTaskCommand {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
  ) {}
}
