import { Club } from 'src/modules/clubs/domain/entities/club.entity';
import { ClubName } from 'src/modules/clubs/domain/value-objects/club-name.vo';
import { ClubDescription } from 'src/modules/clubs/domain/value-objects/club-description.vo';
import { ClubManifesto } from 'src/modules/clubs/domain/value-objects/club-manifesto.vo';
import { ClubVisibility } from 'src/modules/clubs/domain/enums/club-visibility.enum';
import { ClubOrmEntity } from '../entities/club.orm-entity';

export class ClubMapper {
  public static toDomain(raw: ClubOrmEntity): Club {
    return Club.restore(
      raw.id,
      {
        name: ClubName.create(raw.name),
        description: ClubDescription.create(raw.description),
        logoUrl: raw.logoUrl,
        visibility: raw.visibility as ClubVisibility,
        leaders: raw.leaders,
        manifesto: raw.manifesto
          ? ClubManifesto.create(raw.manifesto)
          : undefined,
        slackUrl: raw.slackUrl,
        discordUrl: raw.discordUrl,
        darkThemeEnabled: raw.darkThemeEnabled,
        totalTasksCompleted: raw.totalTasksCompleted,
        totalMeetingsHeld: raw.totalMeetingsHeld,
      },
      raw.createdAt,
      raw.updatedAt,
    );
  }

  public static toPersistence(club: Club): Partial<ClubOrmEntity> {
    return {
      id: club.id,
      name: club.name.toString(),
      description: club.description.toString(),
      logoUrl: club.logoUrl,
      visibility: club.visibility,
      leaders: club.leaders,
      manifesto: club.manifesto?.toString(),
      slackUrl: club.slackUrl,
      discordUrl: club.discordUrl,
      darkThemeEnabled: club.darkThemeEnabled,
      totalTasksCompleted: club.totalTasksCompleted,
      totalMeetingsHeld: club.totalMeetingsHeld,
      createdAt: club.createdAt,
      updatedAt: club.updatedAt,
    };
  }
}
