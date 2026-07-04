export class CreateTagCommand {
  constructor(
    public readonly name: string,
    public readonly color?: string,
  ) {}
}
