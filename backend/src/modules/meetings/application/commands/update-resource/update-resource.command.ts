export class UpdateResourceCommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly url?: string,
  ) {}
}
