import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMeetingRepository } from '../../../../domain/repositories/meeting.repository.interface';
import { Meeting } from '../../../../domain/entities/meeting.entity';
import { MeetingOrmEntity } from '../entities/meeting.orm-entity';
import { MeetingMapper } from '../mappers/meeting.mapper';
import { MeetingStatus } from '../../../../domain/enums/meeting-status.enum';

@Injectable()
export class MeetingRepository implements IMeetingRepository {
  constructor(
    @InjectRepository(MeetingOrmEntity)
    private readonly repository: Repository<MeetingOrmEntity>,
  ) {}

  async save(meeting: Meeting): Promise<Meeting> {
    const ormEntity = MeetingMapper.toPersistence(meeting);
    const saved = await this.repository.save(ormEntity);
    return MeetingMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Meeting | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['participants'],
    });
    return ormEntity ? MeetingMapper.toDomain(ormEntity) : null;
  }

  async findByOrganizerId(organizerId: string): Promise<Meeting[]> {
    const ormEntities = await this.repository.find({
      where: { organizerId },
      relations: ['participants'],
      order: { startTime: 'ASC' },
    });
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findByParticipantId(participantId: string): Promise<Meeting[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participant')
      .where('participant.userId = :participantId', { participantId })
      .orderBy('meeting.startTime', 'ASC')
      .getMany();
    
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findUpcoming(userId: string): Promise<Meeting[]> {
    const now = new Date();
    
    const ormEntities = await this.repository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participant')
      .where(
        '(meeting.organizerId = :userId OR participant.userId = :userId) AND meeting.startTime > :now AND meeting.status IN (:...statuses)',
        {
          userId,
          now,
          statuses: [MeetingStatus.SCHEDULED, MeetingStatus.IN_PROGRESS],
        }
      )
      .orderBy('meeting.startTime', 'ASC')
      .getMany();
    
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Meeting[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participant')
      .where('meeting.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('meeting.startTime', 'ASC')
      .getMany();
    
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findAll(): Promise<Meeting[]> {
    const ormEntities = await this.repository.find({
      relations: ['participants'],
      order: { startTime: 'DESC' },
    });
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async update(meeting: Meeting): Promise<Meeting> {
    const existingOrm = await this.repository.findOne({
      where: { id: meeting.id },
      relations: ['participants'],
    });

    if (!existingOrm) {
      throw new Error('Meeting not found');
    }

    const updatedOrm = MeetingMapper.toOrmForUpdate(meeting, existingOrm);
    const saved = await this.repository.save(updatedOrm);
    return MeetingMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}