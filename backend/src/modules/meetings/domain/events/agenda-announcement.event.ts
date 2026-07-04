export class AgendaAnnouncementEvent {
  constructor(
    public readonly meetingId: string,
    public readonly meetingTitle: string,
    public readonly meetingStartTime: Date,
    public readonly participantIds: string[],
    public readonly agendaItems: Array<{
      title: string;
      description?: string;
      duration?: number;
    }>,
  ) {}
}
