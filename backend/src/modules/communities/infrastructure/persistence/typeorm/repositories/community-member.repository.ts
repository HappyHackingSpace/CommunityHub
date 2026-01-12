import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';
import { CommunityMemberOrmEntity } from '../entities/community-member.orm-entity';
import { CommunityMemberMapper } from '../mappers/community-member.mapper';
import { CommunityMemberStatus } from 'src/modules/communities/domain/enums/community-member-status.enum';
import { CommunityOrmEntity } from '../entities/community.orm-entity';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';

@Injectable()
export class CommunityMemberRepository implements ICommunityMemberRepository {
  constructor(
    @InjectRepository(CommunityMemberOrmEntity)
    private readonly repository: Repository<CommunityMemberOrmEntity>,
    @InjectRepository(CommunityOrmEntity)
    private readonly communityRepository: Repository<CommunityOrmEntity>,
  ) {}

  async create(member: CommunityMember): Promise<void> {
    const ormEntity = CommunityMemberMapper.toPersistence(member);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<CommunityMember | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? CommunityMemberMapper.toDomain(ormEntity) : null;
  }

  async findByCommunityAndUser(
    communityId: string,
    userId: string,
  ): Promise<CommunityMember | null> {
    const ormEntity = await this.repository.findOne({
      where: { communityId, userId },
    });
    return ormEntity ? CommunityMemberMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<CommunityMember[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => CommunityMemberMapper.toDomain(entity));
  }

  async findByCommunityId(communityId: string): Promise<CommunityMember[]> {
    const ormEntities = await this.repository.find({
      where: { communityId },
      order: { appliedAt: 'DESC' },
    });
    return ormEntities.map((entity) => CommunityMemberMapper.toDomain(entity));
  }

  async findByStatus(
    communityId: string,
    status: CommunityMemberStatus,
  ): Promise<CommunityMember[]> {
    const ormEntities = await this.repository.find({
      where: { communityId, status },
      order: { appliedAt: 'DESC' },
    });
    return ormEntities.map((entity) => CommunityMemberMapper.toDomain(entity));
  }

  async findActiveMembershipsByUserId(userId: string): Promise<CommunityMember[]> {
    const ormEntities = await this.repository.find({
      where: {
        userId,
        status: CommunityMemberStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => CommunityMemberMapper.toDomain(entity));
  }

  async findUserTenantsWithCommunityInfo(userId: string): Promise<Array<{ tenantId: number; communityId: string; communityName: string }>> {
    const memberships = await this.repository.find({
      where: {
        userId,
        status: CommunityMemberStatus.ACTIVE,
      },
    });

    const tenants: Array<{ tenantId: number; communityId: string; communityName: string }> = [];

    for (const membership of memberships) {
      const community = await this.communityRepository.findOne({
        where: { id: membership.communityId },
      });

      if (community && community.tenantId) {
        tenants.push({
          tenantId: community.tenantId,
          communityId: community.id,
          communityName: community.name,
        });
      }
    }

    return tenants;
  }

  async update(member: CommunityMember): Promise<void> {
    const ormEntity = CommunityMemberMapper.toPersistence(member);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
