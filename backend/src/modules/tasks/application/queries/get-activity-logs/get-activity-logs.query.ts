export class GetActivityLogsQuery {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
