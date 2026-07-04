export class ApproveMemberApplicationCommand {
  constructor(
    public readonly clubId: string,
    public readonly memberId: string,
    public readonly approverId: string,
  ) {}
}
