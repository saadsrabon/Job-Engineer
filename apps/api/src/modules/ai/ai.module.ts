import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService, AiRepository } from './ai.service';
import { CareerLibraryModule } from '../career-library/career-library.module';
import { JobsModule } from '../jobs/jobs.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CareerLibraryModule, JobsModule, InterviewsModule, UsersModule],
  controllers: [AiController],
  providers: [AiService, AiRepository],
})
export class AiModule {}
