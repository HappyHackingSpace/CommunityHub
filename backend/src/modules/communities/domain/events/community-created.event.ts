export class CommunityCreatedEvent {
  constructor(
    public readonly communityId: string,
    public readonly founderId: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}
}
