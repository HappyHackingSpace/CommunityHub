import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty()
  badgeCount: number;

  @ApiProperty()
  rank: number;
}

export class LeaderboardResponseDto {
  @ApiProperty({ type: [LeaderboardEntryDto] })
  entries: LeaderboardEntryDto[];

  @ApiProperty()
  totalEntries: number;
}
