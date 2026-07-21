import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CareerLibraryModule } from './modules/career-library/career-library.module';
import { ResumeModule } from './modules/resume/resume.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CrmModule } from './modules/crm/crm.module';
import { HealthModule } from './modules/health/health.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { EmailModule } from './modules/email/email.module';
import { AutomationModule } from './modules/automation/automation.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { QUEUE_NAMES } from '@jobos/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? { url: process.env.REDIS_URL }
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
    }),
    BullModule.registerQueue({ name: QUEUE_NAMES.RESUME_PARSE }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CareerLibraryModule,
    ResumeModule,
    JobsModule,
    CrmModule,
    HealthModule,
    InterviewsModule,
    EmailModule,
    AutomationModule,
    AiModule,
    AnalyticsModule,
    AdminModule,
  ],
})
export class AppModule {}
