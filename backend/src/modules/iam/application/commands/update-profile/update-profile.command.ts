export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly displayName?: string,
    public readonly avatarUrl?: string,
    public readonly bio?: string,
  ) {}
}
