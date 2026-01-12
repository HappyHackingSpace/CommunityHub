export class ApproveMembershipCommand {
  constructor(
    public readonly communityId: string,
    public readonly memberId: string,
    public readonly adminId: string,
  ) {}
}
