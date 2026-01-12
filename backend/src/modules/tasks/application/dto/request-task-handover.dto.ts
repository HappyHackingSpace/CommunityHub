import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestTaskHandoverDto {
  @ApiProperty({
    description: 'The reason for requesting task handover',
    example: 'I no longer have the required skills or time to complete this task',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Handover reason must be at least 10 characters' })
  @MaxLength(1000, { message: 'Handover reason cannot exceed 1000 characters' })
  reason: string;
}
