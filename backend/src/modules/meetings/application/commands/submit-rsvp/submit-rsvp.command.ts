import { RsvpStatus } from '../../../domain/enums/rsvp-status.enum';

export class SubmitRsvpCommand {
  constructor(
    public readonly meetingId: string,
    public readonly userId: string,
    public readonly status: RsvpStatus,
    public readonly notes?: string,
  ) {}
}
