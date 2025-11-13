export class AddMemberCommand {
  constructor(
    public readonly clubId: string,
    public readonly userId: string,
    public readonly roleId?: string,
  ) {}
}
