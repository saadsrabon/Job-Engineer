import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeRepository } from './resume.repository';
import { CareerLibraryModule } from '../career-library/career-library.module';
import { UsersModule } from '../users/users.module';
import { QUEUE_NAMES } from '@jobos/shared';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.RESUME_PARSE }),
    CareerLibraryModule,
    UsersModule,
  ],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeRepository],
  exports: [ResumeService, ResumeRepository],
})
export class ResumeModule {}
