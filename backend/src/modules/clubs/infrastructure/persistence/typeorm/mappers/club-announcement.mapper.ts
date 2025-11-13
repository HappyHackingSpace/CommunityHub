import { ClubAnnouncement, AnnouncementScope } from 'src/modules/clubs/domain/entities/club-announcement.entity';
import { ClubAnnouncementOrmEntity } from '../entities/club-announcement.orm-entity';

export class ClubAnnouncementMapper {
  public static toDomain(raw: ClubAnnouncementOrmEntity): ClubAnnouncement {
    return ClubAnnouncement.restore(
      raw.id,
      {
        clubId: raw.clubId,
        authorId: raw.authorId,
        title: raw.title,
        content: raw.content,
        scope: raw.scope as AnnouncementScope,
        isPinned: raw.isPinned,
      },
      raw.createdAt,
      raw.updatedAt,
    );
  }

  public static toPersistence(
    announcement: ClubAnnouncement,
  ): Partial<ClubAnnouncementOrmEntity> {
    return {
      id: announcement.id,
      clubId: announcement.clubId,
      authorId: announcement.authorId,
      title: announcement.title,
      content: announcement.content,
      scope: announcement.scope,
      isPinned: announcement.isPinned,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
    };
  }
}
