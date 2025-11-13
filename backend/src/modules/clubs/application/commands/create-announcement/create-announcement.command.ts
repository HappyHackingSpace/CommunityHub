export class CreateAnnouncementCommand {
  constructor(
    public readonly clubId: string,
    public readonly authorId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly scope: string,
    public readonly isPinned?: boolean,
  ) {}
}
