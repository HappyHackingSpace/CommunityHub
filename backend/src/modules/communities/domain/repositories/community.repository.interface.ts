import { Community } from '../entities/community.entity';

export interface ICommunityRepository {
  create(community: Community): Promise<void>;
  findById(id: string): Promise<Community | null>;
  findByName(name: string): Promise<Community | null>;
  findAll(): Promise<Community[]>;
  findByFounderId(founderId: string): Promise<Community[]>;
  update(community: Community): Promise<void>;
  delete(id: string): Promise<void>;
}
