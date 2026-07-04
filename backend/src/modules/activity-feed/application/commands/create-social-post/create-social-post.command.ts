export class CreateSocialPostCommand {
  constructor(
    public readonly authorId: string,
    public readonly content: string,
    public readonly imageUrls?: string[],
  ) {}
}
