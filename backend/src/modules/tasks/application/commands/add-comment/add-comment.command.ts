export class AddCommentCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly content: string,
  ) {}
}
