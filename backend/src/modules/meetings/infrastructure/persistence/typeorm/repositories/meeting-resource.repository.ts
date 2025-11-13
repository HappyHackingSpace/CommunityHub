import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMeetingResourceRepository } from '../../../../domain/repositories/meeting-resource.repository.interface';
import { MeetingResource } from '../../../../domain/entities/meeting-resource.entity';
import { MeetingResourceOrmEntity } from '../entities/meeting-resource.orm-entity';
import { MeetingResourceMapper } from '../mappers/meeting-resource.mapper';

@Injectable()
export class MeetingResourceRepository implements IMeetingResourceRepository {
  constructor(
    @InjectRepository(MeetingResourceOrmEntity)
    private readonly repository: Repository<MeetingResourceOrmEntity>,
  ) {}

  async save(resource: MeetingResource): Promise<MeetingResource> {
    const ormEntity = MeetingResourceMapper.toOrm(resource);
    const saved = await this.repository.save(ormEntity);
    return MeetingResourceMapper.toDomain(saved);
  }

  async findById(id: string): Promise<MeetingResource | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? MeetingResourceMapper.toDomain(ormEntity) : null;
  }

  async findByMeetingId(meetingId: string): Promise<MeetingResource[]> {
    const ormEntities = await this.repository.find({
      where: { meetingId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map(MeetingResourceMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
