export class AttachTagsCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
    public readonly tagIds: string[],
  ) {}
}
