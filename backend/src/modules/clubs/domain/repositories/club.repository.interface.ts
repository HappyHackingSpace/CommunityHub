import { Club } from '../entities/club.entity';

export interface IClubRepository {
  create(club: Club): Promise<void>;
  findById(id: string): Promise<Club | null>;
  findByName(name: string): Promise<Club | null>;
  update(club: Club): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Club[]>;
  findPublicClubs(): Promise<Club[]>;
  findClubsByLeader(leaderId: string): Promise<Club[]>;
}
