export class HelpNeededEvent {
  constructor(
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly requestedBy: string,
    public readonly message: string,
  ) {}
}
