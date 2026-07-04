export class MemberJoinedEvent {
  constructor(
    public readonly clubId: string,
    public readonly userId: string,
    public readonly joinedAt: Date,
  ) {}
}
