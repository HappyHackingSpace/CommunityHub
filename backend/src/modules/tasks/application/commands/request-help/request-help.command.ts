export class RequestHelpCommand {
  constructor(
    public readonly taskId: string,
    public readonly requestedBy: string,
    public readonly message: string,
  ) {}
}
