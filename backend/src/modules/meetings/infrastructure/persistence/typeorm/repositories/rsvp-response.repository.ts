import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRsvpResponseRepository } from '../../../../domain/repositories/rsvp-response.repository.interface';
import { RsvpResponse } from '../../../../domain/entities/rsvp-response.entity';
import { RsvpResponseOrmEntity } from '../entities/rsvp-response.orm-entity';
import { RsvpResponseMapper } from '../mappers/rsvp-response.mapper';

@Injectable()
export class RsvpResponseRepository implements IRsvpResponseRepository {
  constructor(
    @InjectRepository(RsvpResponseOrmEntity)
    private readonly repository: Repository<RsvpResponseOrmEntity>,
  ) {}

  async save(rsvp: RsvpResponse): Promise<RsvpResponse> {
    const ormEntity = RsvpResponseMapper.toOrm(rsvp);
    const saved = await this.repository.save(ormEntity);
    return RsvpResponseMapper.toDomain(saved);
  }

  async findById(id: string): Promise<RsvpResponse | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? RsvpResponseMapper.toDomain(ormEntity) : null;
  }

  async findByMeetingId(meetingId: string): Promise<RsvpResponse[]> {
    const ormEntities = await this.repository.find({
      where: { meetingId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map(RsvpResponseMapper.toDomain);
  }

  async findByMeetingAndUser(
    meetingId: string,
    userId: string,
  ): Promise<RsvpResponse | null> {
    const ormEntity = await this.repository.findOne({
      where: { meetingId, userId },
    });
    return ormEntity ? RsvpResponseMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<RsvpResponse[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(RsvpResponseMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
