export class MembershipApplicationSubmittedEvent {
  constructor(
    public readonly communityId: string,
    public readonly userId: string,
    public readonly memberId: string,
    public readonly appliedAt: Date,
  ) {}
}
