import { IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GenerateEmailDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  jobId!: string;

  @IsIn(['follow-up', 'thank-you', 'networking'])
  templateId!: 'follow-up' | 'thank-you' | 'networking';
}
