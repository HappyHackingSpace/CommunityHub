export class ClubCreatedEvent {
  constructor(
    public readonly clubId: string,
    public readonly name: string,
    public readonly leaderId: string,
    public readonly createdAt: Date,
  ) {}
}
