export class RegisterUserCommand {
  constructor(
    public readonly googleId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly avatarUrl?: string,
  ) {}
}