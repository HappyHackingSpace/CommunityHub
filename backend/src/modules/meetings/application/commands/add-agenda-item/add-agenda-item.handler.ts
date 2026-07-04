import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddAgendaItemCommand } from './add-agenda-item.command';
import type { IAgendaItemRepository } from '../../../domain/repositories/agenda-item.repository.interface';
import { AgendaItem } from '../../../domain/entities/agenda-item.entity';

@CommandHandler(AddAgendaItemCommand)
export class AddAgendaItemHandler implements ICommandHandler<AddAgendaItemCommand> {
  constructor(
    @Inject('IAgendaItemRepository')
    private readonly agendaItemRepository: IAgendaItemRepository,
  ) {}

  async execute(command: AddAgendaItemCommand): Promise<string> {
    const { meetingId, title, description, duration, order, presenterId } = command;

    const agendaItem = AgendaItem.create({
      meetingId,
      title,
      description,
      duration,
      order,
      presenter: presenterId,
    });

    const saved = await this.agendaItemRepository.save(agendaItem);
    return saved.id;
  }
}
