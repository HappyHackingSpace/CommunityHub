import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgendaItemDto {
  @ApiProperty({
    description: 'Title of the agenda item',
    example: 'Q4 Financial Review',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the agenda item',
    example: 'Review Q4 financial performance and discuss projections for Q1',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Duration of the agenda item in minutes',
    example: 15,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'Order/position of this item in the agenda',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({
    description: 'User ID of the presenter for this agenda item',
    example: 'user_123abc',
  })
  @IsString()
  @IsOptional()
  presenterId?: string;
}
