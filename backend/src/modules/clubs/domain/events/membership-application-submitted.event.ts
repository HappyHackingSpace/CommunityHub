export class MembershipApplicationSubmittedEvent {
  constructor(
    public readonly clubId: string,
    public readonly userId: string,
    public readonly appliedAt: Date,
  ) {}
}
