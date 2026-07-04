import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { MentorAssignedEvent } from '../../../tasks/domain/events';

@Injectable()
@EventsHandler(MentorAssignedEvent)
export class MentorAssignedHandler implements IEventHandler<MentorAssignedEvent> {
  private readonly logger = new Logger(MentorAssignedHandler.name);

  constructor() {}

  async handle(event: MentorAssignedEvent) {
    this.logger.log(
      `Handling mentor assigned event for task ${event.taskId}, mentor ${event.mentorId}`,
    );

    try {
      // Log mentor assignment
      // Note: Mentor assignment notifications can be extended here
      // when a MENTOR_ASSIGNED notification type is added to NotificationType enum
      this.logger.debug(
        `Mentor ${event.mentorId} assigned to task ${event.taskId} (${event.taskTitle})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle mentor assigned event: ${error.message}`,
        error.stack,
      );
    }
  }
}
