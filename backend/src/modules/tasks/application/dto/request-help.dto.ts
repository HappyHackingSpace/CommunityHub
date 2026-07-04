import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestHelpDto {
  @ApiProperty({
    description: 'The message describing what help is needed',
    example: 'I need help with database optimization and query performance',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Help message must be at least 10 characters' })
  @MaxLength(1000, { message: 'Help message cannot exceed 1000 characters' })
  message: string;
}
