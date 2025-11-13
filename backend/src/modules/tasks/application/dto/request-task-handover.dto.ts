import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestTaskHandoverDto {
  @ApiProperty({
    description: 'The reason for requesting task handover',
    example: 'I no longer have the required skills or time to complete this task',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
