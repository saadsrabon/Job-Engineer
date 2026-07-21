import { Module } from '@nestjs/common';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { InterviewsRepository } from './interviews.repository';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewsRepository],
  exports: [InterviewsService, InterviewsRepository],
})
export class InterviewsModule {}
