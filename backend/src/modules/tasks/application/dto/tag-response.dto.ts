import { Tag } from '../../domain/entities/tag.entity';

export class TagResponseDto {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name.value,
      color: tag.color,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
