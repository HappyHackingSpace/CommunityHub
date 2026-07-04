export class MeetingCancelledEvent {
  constructor(
    public readonly meetingId: string,
    public readonly organizerId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
