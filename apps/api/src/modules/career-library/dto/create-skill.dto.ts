import { IsString, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  level?: string;
}
