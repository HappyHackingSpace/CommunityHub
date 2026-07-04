import { AgendaItem } from '../entities/agenda-item.entity';

export interface IAgendaItemRepository {
  save(agendaItem: AgendaItem): Promise<AgendaItem>;
  findById(id: string): Promise<AgendaItem | null>;
  findByMeetingId(meetingId: string): Promise<AgendaItem[]>;
  delete(id: string): Promise<void>;
}
