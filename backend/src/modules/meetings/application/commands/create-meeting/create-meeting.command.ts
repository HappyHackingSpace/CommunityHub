export class CreateMeetingCommand {
  constructor(
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly startTime: Date,
    public readonly duration: number,
    public readonly organizerId: string,
    public readonly meetingUrl: string | undefined,
    public readonly participantIds: string[],
  ) {}
}