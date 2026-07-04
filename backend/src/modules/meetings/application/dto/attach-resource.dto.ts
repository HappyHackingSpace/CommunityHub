import { IsString, IsNotEmpty, IsUrl, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceType } from '../../domain/enums/resource-type.enum';

export class AttachResourceDto {
  @ApiProperty({
    description: 'Title of the resource',
    example: 'Q4 Presentation Slides',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'URL to the resource',
    example: 'https://docs.google.com/presentation/d/abc123',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Type of the resource',
    enum: ResourceType,
    example: ResourceType.PRESENTATION,
  })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiPropertyOptional({
    description: 'Optional description of the resource',
    example: 'Slides for the Q4 review meeting',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
