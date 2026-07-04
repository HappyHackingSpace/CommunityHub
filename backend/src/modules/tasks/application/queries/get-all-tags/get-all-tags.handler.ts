import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllTagsQuery } from './get-all-tags.query';
import { TagResponseDto } from '../../dto/tag-response.dto';
import type { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

@QueryHandler(GetAllTagsQuery)
export class GetAllTagsHandler implements IQueryHandler<GetAllTagsQuery> {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(query: GetAllTagsQuery): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.findAll();
    return tags.map((tag) => TagResponseDto.fromDomain(tag));
  }
}
