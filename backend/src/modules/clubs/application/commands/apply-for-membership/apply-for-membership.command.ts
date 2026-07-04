export class ApplyForMembershipCommand {
  constructor(
    public readonly clubId: string,
    public readonly userId: string,
  ) {}
}
