import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSocialPostDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
