export class AcceptInvitationCommand {
  constructor(
    public readonly meetingId: string,
    public readonly participantId: string,
  ) {}
}