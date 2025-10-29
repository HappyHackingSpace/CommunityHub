export class AddParticipantCommand {
  constructor(
    public readonly meetingId: string,
    public readonly participantId: string,
    public readonly organizerId: string,
  ) {}
}