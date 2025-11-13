import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateAgendaItemCommand } from './update-agenda-item.command';
import { AgendaItem } from '../../../domain/entities/agenda-item.entity';
import type { IAgendaItemRepository } from '../../../domain/repositories/agenda-item.repository.interface';
import type { IMeetingRepository } from '../../../domain/repositories/meeting.repository.interface';

@CommandHandler(UpdateAgendaItemCommand)
export class UpdateAgendaItemHandler implements ICommandHandler<UpdateAgendaItemCommand> {
  constructor(
    @Inject('IAgendaItemRepository')
    private readonly agendaItemRepository: IAgendaItemRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(command: UpdateAgendaItemCommand): Promise<AgendaItem> {
    const { agendaItemId, userId, title, description, duration, presenterId } = command;

    // Find agenda item
    const agendaItem = await this.agendaItemRepository.findById(agendaItemId);
    if (!agendaItem) {
      throw new Error('Agenda item not found');
    }

    // Verify user has permission (meeting organizer or presenter)
    const meeting = await this.meetingRepository.findById(agendaItem.meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.organizerId !== userId && agendaItem.presenter !== userId) {
      throw new Error('Only the meeting organizer or presenter can update this agenda item');
    }

    // Update agenda item
    agendaItem.update({
      title,
      description,
      duration,
      presenter: presenterId,
    });

    // Save updated agenda item
    const savedItem = await this.agendaItemRepository.save(agendaItem);

    return savedItem;
  }
}
