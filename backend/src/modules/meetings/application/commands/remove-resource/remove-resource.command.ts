export class RemoveResourceCommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
  ) {}
}
