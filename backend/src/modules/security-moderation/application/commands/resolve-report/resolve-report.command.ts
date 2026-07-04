export class ResolveReportCommand {
  constructor(
    public readonly reportId: string,
    public readonly moderatorId: string,
    public readonly resolutionNotes: string,
  ) {}
}
