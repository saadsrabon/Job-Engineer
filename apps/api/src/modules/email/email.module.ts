import { Module } from '@nestjs/common';
import { EmailModuleController } from './email.controller';
import { EmailService, EmailRepository } from './email.service';
import { CareerLibraryModule } from '../career-library/career-library.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CareerLibraryModule, JobsModule, UsersModule],
  controllers: [EmailModuleController],
  providers: [EmailService, EmailRepository],
})
export class EmailModule {}
