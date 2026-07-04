export class MeetingCreatedEvent {
  constructor(
    public readonly meetingId: string,
    public readonly organizerId: string,
    public readonly startTime: Date,
    public readonly occurredAt: Date = new Date(),
  ) {}
}