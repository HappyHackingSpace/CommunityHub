export class AddSubTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly title: string,
  ) {}
}
