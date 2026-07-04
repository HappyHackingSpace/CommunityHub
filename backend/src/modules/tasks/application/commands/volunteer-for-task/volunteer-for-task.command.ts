export class VolunteerForTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
