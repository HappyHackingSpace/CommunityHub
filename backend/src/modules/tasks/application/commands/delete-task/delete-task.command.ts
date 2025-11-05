export class DeleteTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
