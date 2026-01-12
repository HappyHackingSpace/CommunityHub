export class RejectMembershipCommand {
  constructor(
    public readonly communityId: string,
    public readonly memberId: string,
  ) {}
}
