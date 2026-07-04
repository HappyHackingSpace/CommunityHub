import { Tag } from '../entities/tag.entity';

export interface ITagRepository {
  save(tag: Tag): Promise<Tag>;
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findByIds(ids: string[]): Promise<Tag[]>;
  delete(id: string): Promise<void>;
}
