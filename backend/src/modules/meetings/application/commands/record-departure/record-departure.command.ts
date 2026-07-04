export class RecordDepartureCommand {
  constructor(
    public readonly meetingId: string,
    public readonly userId: string,
  ) {}
}
