export class GetTaskQuery {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
