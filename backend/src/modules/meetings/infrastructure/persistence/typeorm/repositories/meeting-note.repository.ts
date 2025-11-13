import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMeetingNoteRepository } from '../../../../domain/repositories/meeting-note.repository.interface';
import { MeetingNote } from '../../../../domain/entities/meeting-note.entity';
import { MeetingNoteOrmEntity } from '../entities/meeting-note.orm-entity';
import { MeetingNoteMapper } from '../mappers/meeting-note.mapper';

@Injectable()
export class MeetingNoteRepository implements IMeetingNoteRepository {
  constructor(
    @InjectRepository(MeetingNoteOrmEntity)
    private readonly repository: Repository<MeetingNoteOrmEntity>,
  ) {}

  async save(note: MeetingNote): Promise<MeetingNote> {
    const ormEntity = MeetingNoteMapper.toOrm(note);
    const saved = await this.repository.save(ormEntity);
    return MeetingNoteMapper.toDomain(saved);
  }

  async findById(id: string): Promise<MeetingNote | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? MeetingNoteMapper.toDomain(ormEntity) : null;
  }

  async findByMeetingId(meetingId: string): Promise<MeetingNote[]> {
    const ormEntities = await this.repository.find({
      where: { meetingId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map(MeetingNoteMapper.toDomain);
  }

  async findActionItemsByMeetingId(meetingId: string): Promise<MeetingNote[]> {
    const ormEntities = await this.repository.find({
      where: { meetingId, noteType: 'action_item' },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map(MeetingNoteMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
