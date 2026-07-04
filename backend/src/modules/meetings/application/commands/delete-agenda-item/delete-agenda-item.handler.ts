import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteAgendaItemCommand } from './delete-agenda-item.command';
import type { IAgendaItemRepository } from '../../../domain/repositories/agenda-item.repository.interface';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(DeleteAgendaItemCommand)
export class DeleteAgendaItemHandler implements ICommandHandler<DeleteAgendaItemCommand> {
  constructor(
    @Inject('IAgendaItemRepository')
    private readonly agendaItemRepository: IAgendaItemRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: DeleteAgendaItemCommand): Promise<void> {
    const { agendaItemId, userId } = command;

    // Find agenda item
    const agendaItem = await this.agendaItemRepository.findById(agendaItemId);
    if (!agendaItem) {
      throw new Error('Agenda item not found');
    }

    // Verify user has permission (meeting organizer)
    const meeting = await this.meetingRepository.findById(agendaItem.meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.organizerId !== userId) {
      throw new Error('Only the meeting organizer can delete agenda items');
    }

    // Delete agenda item
    await this.agendaItemRepository.delete(agendaItemId);
  }
}
