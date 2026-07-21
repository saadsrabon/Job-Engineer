import { IsString, IsOptional } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  name!: string;

  @IsString()
  issuer!: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  url?: string;
}

export class CreateAwardDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateLanguageDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  proficiency?: string;
}

export class CreateSocialLinkDto {
  @IsString()
  platform!: string;

  @IsString()
  url!: string;
}
