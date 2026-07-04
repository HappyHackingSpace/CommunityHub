export class ClubAnnouncementResponseDto {
  id: string;
  clubId: string;
  authorId: string;
  title: string;
  content: string;
  scope: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
