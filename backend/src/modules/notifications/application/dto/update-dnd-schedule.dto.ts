// src/modules/notifications/application/dto/update-dnd-schedule.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional, Matches } from 'class-validator';

export class UpdateDndScheduleDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: '22:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
