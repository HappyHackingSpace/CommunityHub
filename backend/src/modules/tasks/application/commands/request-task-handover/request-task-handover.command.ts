export class RequestTaskHandoverCommand {
  constructor(
    public readonly taskId: string,
    public readonly requestedBy: string,
    public readonly reason: string,
  ) {}
}
