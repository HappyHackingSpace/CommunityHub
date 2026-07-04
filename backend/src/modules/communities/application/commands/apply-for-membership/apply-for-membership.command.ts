export class ApplyForMembershipCommand {
  constructor(
    public readonly communityId: string,
    public readonly userId: string,
  ) {}
}
