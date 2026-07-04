export class DetachTagCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly tagId: string,
  ) {}
}
