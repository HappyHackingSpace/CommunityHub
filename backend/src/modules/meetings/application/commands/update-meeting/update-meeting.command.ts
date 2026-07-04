export class UpdateMeetingCommand {
  constructor(
    public readonly meetingId: string,
    public readonly organizerId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly startTime?: Date,
    public readonly duration?: number,
    public readonly meetingUrl?: string,
  ) {}
}