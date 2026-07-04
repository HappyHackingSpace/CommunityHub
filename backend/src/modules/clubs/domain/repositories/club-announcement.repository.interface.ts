import { ClubAnnouncement } from '../entities/club-announcement.entity';

export interface IClubAnnouncementRepository {
  create(announcement: ClubAnnouncement): Promise<void>;
  findById(id: string): Promise<ClubAnnouncement | null>;
  update(announcement: ClubAnnouncement): Promise<void>;
  delete(id: string): Promise<void>;
  findByClub(clubId: string): Promise<ClubAnnouncement[]>;
  findPinnedByClub(clubId: string): Promise<ClubAnnouncement[]>;
}
