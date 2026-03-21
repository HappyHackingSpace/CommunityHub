export class UnlikePostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}
