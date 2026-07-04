export class GetUserMeetingsQuery {
  constructor(
    public readonly userId: string,
    public readonly includeAsOrganizer: boolean = true,
    public readonly includeAsParticipant: boolean = true,
  ) {}
}