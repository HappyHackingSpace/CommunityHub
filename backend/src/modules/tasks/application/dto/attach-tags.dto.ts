import { IsArray, IsUUID } from 'class-validator';

export class AttachTagsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}
