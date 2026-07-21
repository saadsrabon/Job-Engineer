import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  jobId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsDateString()
  dueAt!: string;
}
