import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAgendaItemRepository } from '../../../../domain/repositories/agenda-item.repository.interface';
import { AgendaItem } from '../../../../domain/entities/agenda-item.entity';
import { AgendaItemOrmEntity } from '../entities/agenda-item.orm-entity';
import { AgendaItemMapper } from '../mappers/agenda-item.mapper';

@Injectable()
export class AgendaItemRepository implements IAgendaItemRepository {
  constructor(
    @InjectRepository(AgendaItemOrmEntity)
    private readonly repository: Repository<AgendaItemOrmEntity>,
  ) {}

  async save(agendaItem: AgendaItem): Promise<AgendaItem> {
    const ormEntity = AgendaItemMapper.toOrm(agendaItem);
    const saved = await this.repository.save(ormEntity);
    return AgendaItemMapper.toDomain(saved);
  }

  async findById(id: string): Promise<AgendaItem | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? AgendaItemMapper.toDomain(ormEntity) : null;
  }

  async findByMeetingId(meetingId: string): Promise<AgendaItem[]> {
    const ormEntities = await this.repository.find({
      where: { meetingId },
      order: { order: 'ASC' },
    });
    return ormEntities.map(AgendaItemMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
