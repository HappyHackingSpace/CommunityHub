import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import { GetMeetingQuery } from '../../application/queries/get-meeting/get-meeting.query';
import { EventPrivacy } from '../../domain/enums/event-privacy.enum';

@Injectable()
export class MeetingPrivacyGuard implements CanActivate {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const meetingId = request.params.id || request.params.meetingId;

    if (!meetingId) {
      // If no meeting ID in params, allow access (non-meeting specific endpoints)
      return true;
    }

    if (!userId) {
      throw new ForbiddenException('User must be authenticated');
    }

    try {
      // Fetch meeting details
      const meeting = await this.queryBus.execute(new GetMeetingQuery(meetingId));

      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      // Public meetings are accessible to everyone
      if (meeting.privacy === EventPrivacy.PUBLIC) {
        return true;
      }

      // Private meetings are only accessible to organizer and participants
      if (meeting.privacy === EventPrivacy.PRIVATE) {
        const isOrganizer = meeting.organizerId === userId;
        const isParticipant = meeting.participantIds?.includes(userId);

        if (isOrganizer || isParticipant) {
          return true;
        }

        throw new ForbiddenException(
          'You do not have permission to access this private meeting',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify meeting access');
    }
  }
}
