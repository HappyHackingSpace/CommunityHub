import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetClubQuery } from './get-club.query';
import { Club } from 'src/modules/clubs/domain/entities/club.entity';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';

@QueryHandler(GetClubQuery)
export class GetClubHandler implements IQueryHandler<GetClubQuery> {
  constructor(
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(query: GetClubQuery): Promise<Club> {
    const club = await this.clubRepository.findById(query.clubId);
    if (!club) {
      throw new NotFoundException('Club not found');
    }
    return club;
  }
}
