export class AddLeaderCommand {
  constructor(
    public readonly clubId: string,
    public readonly userId: string,
  ) {}
}
