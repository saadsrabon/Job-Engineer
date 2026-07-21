import { IsIn, IsUUID } from 'class-validator';

export class GenerateEmailDto {
  @IsUUID()
  jobId!: string;

  @IsIn(['follow-up', 'thank-you', 'networking'])
  templateId!: 'follow-up' | 'thank-you' | 'networking';
}
