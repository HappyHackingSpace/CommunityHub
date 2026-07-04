import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllClubsQuery } from './get-all-clubs.query';
import { Club } from 'src/modules/clubs/domain/entities/club.entity';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';

@QueryHandler(GetAllClubsQuery)
export class GetAllClubsHandler implements IQueryHandler<GetAllClubsQuery> {
  constructor(
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(): Promise<Club[]> {
    return this.clubRepository.findAll();
  }
}
