import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClubAnnouncementsQuery } from './get-club-announcements.query';
import { ClubAnnouncement } from 'src/modules/clubs/domain/entities/club-announcement.entity';
import type { IClubAnnouncementRepository } from 'src/modules/clubs/domain/repositories/club-announcement.repository.interface';

@QueryHandler(GetClubAnnouncementsQuery)
export class GetClubAnnouncementsHandler
  implements IQueryHandler<GetClubAnnouncementsQuery>
{
  constructor(
    @Inject('IClubAnnouncementRepository')
    private readonly announcementRepository: IClubAnnouncementRepository,
  ) {}

  async execute(query: GetClubAnnouncementsQuery): Promise<ClubAnnouncement[]> {
    return this.announcementRepository.findByClub(query.clubId);
  }
}
