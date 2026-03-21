export class MembershipApprovedEvent {
  constructor(
    public readonly communityId: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly approvedAt: Date,
  ) {}
}
