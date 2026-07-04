import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAgendaItemsQuery } from './get-agenda-items.query';
import { AgendaItem } from '../../../domain/entities/agenda-item.entity';
import type { IAgendaItemRepository } from '../../../domain/repositories/agenda-item.repository.interface';

@QueryHandler(GetAgendaItemsQuery)
export class GetAgendaItemsHandler implements IQueryHandler<GetAgendaItemsQuery> {
  constructor(
    @Inject('IAgendaItemRepository')
    private readonly agendaItemRepository: IAgendaItemRepository,
  ) {}

  async execute(query: GetAgendaItemsQuery): Promise<AgendaItem[]> {
    const { meetingId } = query;
    return this.agendaItemRepository.findByMeetingId(meetingId);
  }
}
