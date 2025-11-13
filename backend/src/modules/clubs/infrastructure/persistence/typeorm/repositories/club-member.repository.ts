import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';
import { MembershipStatus } from 'src/modules/clubs/domain/enums/membership-status.enum';
import { ClubMemberOrmEntity } from '../entities/club-member.orm-entity';
import { ClubMemberMapper } from '../mappers/club-member.mapper';

@Injectable()
export class ClubMemberRepository implements IClubMemberRepository {
  constructor(
    @InjectRepository(ClubMemberOrmEntity)
    private readonly repository: Repository<ClubMemberOrmEntity>,
  ) {}

  async create(member: ClubMember): Promise<void> {
    const ormEntity = ClubMemberMapper.toPersistence(member);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<ClubMember | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? ClubMemberMapper.toDomain(ormEntity) : null;
  }

  async findByClubAndUser(
    clubId: string,
    userId: string,
  ): Promise<ClubMember | null> {
    const ormEntity = await this.repository.findOne({
      where: { clubId, userId },
    });
    return ormEntity ? ClubMemberMapper.toDomain(ormEntity) : null;
  }

  async update(member: ClubMember): Promise<void> {
    const ormEntity = ClubMemberMapper.toPersistence(member);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findMembersByClub(clubId: string): Promise<ClubMember[]> {
    const ormEntities = await this.repository.find({ where: { clubId } });
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findMembersByClubAndStatus(
    clubId: string,
    status: MembershipStatus,
  ): Promise<ClubMember[]> {
    const ormEntities = await this.repository.find({
      where: { clubId, status },
    });
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findActiveMembersByClub(clubId: string): Promise<ClubMember[]> {
    const ormEntities = await this.repository.find({
      where: { clubId, status: MembershipStatus.APPROVED },
    });
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findPendingApplicationsByClub(clubId: string): Promise<ClubMember[]> {
    const ormEntities = await this.repository.find({
      where: { clubId, status: MembershipStatus.PENDING },
    });
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findUserClubs(userId: string): Promise<ClubMember[]> {
    const ormEntities = await this.repository.find({ where: { userId } });
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }
}
