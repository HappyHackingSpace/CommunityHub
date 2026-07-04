export class ParticipantAddedEvent {
  constructor(
    public readonly meetingId: string,
    public readonly participantId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}