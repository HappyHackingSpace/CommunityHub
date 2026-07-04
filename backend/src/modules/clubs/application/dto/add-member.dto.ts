import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({
    description: 'UUID of the user to add as a member',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @ApiPropertyOptional({
    description: 'UUID of the role to assign to the member',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  roleId?: string;
}
