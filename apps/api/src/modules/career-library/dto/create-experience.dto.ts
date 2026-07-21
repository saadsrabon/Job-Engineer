import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  company!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  startDate!: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bullets?: string[];
}
