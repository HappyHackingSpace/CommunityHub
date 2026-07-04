export class RemoveMemberCommand {
  constructor(
    public readonly clubId: string,
    public readonly memberId: string,
  ) {}
}
