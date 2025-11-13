import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestHelpDto {
  @ApiProperty({
    description: 'The message describing what help is needed',
    example: 'I need help with database optimization and query performance',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
