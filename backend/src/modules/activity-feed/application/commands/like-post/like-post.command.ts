export class LikePostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}
