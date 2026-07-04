export class CancelMeetingCommand {
  constructor(
    public readonly meetingId: string,
    public readonly organizerId: string,
  ) {}
}