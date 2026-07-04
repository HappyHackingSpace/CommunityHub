export class MarkAttendedCommand {
  constructor(
    public readonly meetingId: string,
    public readonly userId: string,
  ) {}
}
