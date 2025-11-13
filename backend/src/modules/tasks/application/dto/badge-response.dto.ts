import { ApiProperty } from '@nestjs/swagger';
import { BadgeType } from '../../domain/enums/badge-type.enum';

export class BadgeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: BadgeType })
  type: BadgeType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  points: number;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;
}
