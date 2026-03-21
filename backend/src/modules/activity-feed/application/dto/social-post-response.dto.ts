export class SocialPostResponseDto {
  id: string;
  authorId: string;
  content: string;
  imageUrls?: string[];
  likesCount: number;
  commentsCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  likedBy: string[];
}
