import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubAnnouncement } from 'src/modules/clubs/domain/entities/club-announcement.entity';
import { IClubAnnouncementRepository } from 'src/modules/clubs/domain/repositories/club-announcement.repository.interface';
import { ClubAnnouncementOrmEntity } from '../entities/club-announcement.orm-entity';
import { ClubAnnouncementMapper } from '../mappers/club-announcement.mapper';

@Injectable()
export class ClubAnnouncementRepository implements IClubAnnouncementRepository {
  constructor(
    @InjectRepository(ClubAnnouncementOrmEntity)
    private readonly repository: Repository<ClubAnnouncementOrmEntity>,
  ) {}

  async create(announcement: ClubAnnouncement): Promise<void> {
    const ormEntity = ClubAnnouncementMapper.toPersistence(announcement);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<ClubAnnouncement | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? ClubAnnouncementMapper.toDomain(ormEntity) : null;
  }

  async update(announcement: ClubAnnouncement): Promise<void> {
    const ormEntity = ClubAnnouncementMapper.toPersistence(announcement);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByClub(clubId: string): Promise<ClubAnnouncement[]> {
    const ormEntities = await this.repository.find({
      where: { clubId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => ClubAnnouncementMapper.toDomain(entity));
  }

  async findPinnedByClub(clubId: string): Promise<ClubAnnouncement[]> {
    const ormEntities = await this.repository.find({
      where: { clubId, isPinned: true },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => ClubAnnouncementMapper.toDomain(entity));
  }
}
