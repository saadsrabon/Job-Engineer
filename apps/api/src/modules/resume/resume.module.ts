import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ResumeController } from './resume.controller';
import { ResumeService, ResumeRepository } from './resume.service';
import { QUEUE_NAMES } from '@jobos/shared';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.RESUME_PARSE })],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeRepository],
  exports: [ResumeService, ResumeRepository],
})
export class ResumeModule {}
