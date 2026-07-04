export class GetAssignmentHistoryQuery {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
