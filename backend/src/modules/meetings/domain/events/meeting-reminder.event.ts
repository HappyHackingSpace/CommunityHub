export class MeetingReminderEvent {
  constructor(
    public readonly meetingId: string,
    public readonly reminderType: 'one_week' | 'one_day' | 'one_hour',
    public readonly meetingTitle: string,
    public readonly meetingStartTime: Date,
    public readonly participantIds: string[],
    public readonly meetingUrl?: string,
  ) {}
}
