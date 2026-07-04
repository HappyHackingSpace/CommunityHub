export class DeclineInvitationCommand {
  constructor(
    public readonly meetingId: string,
    public readonly participantId: string,
  ) {}
}