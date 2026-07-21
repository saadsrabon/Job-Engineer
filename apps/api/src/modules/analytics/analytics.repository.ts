import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient, PipelineStage } from '@jobos/database';

@Injectable()
export class AnalyticsRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  getJobs(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      select: { stage: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  getStageHistory(userId: string) {
    return this.prisma.jobStageHistory.findMany({
      where: { job: { userId } },
      select: { toStage: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const APPLIED_STAGES: PipelineStage[] = [
  PipelineStage.Applied,
  PipelineStage.Assessment,
  PipelineStage.Interview,
  PipelineStage.HR,
  PipelineStage.Negotiation,
  PipelineStage.Offer,
  PipelineStage.Accepted,
];

export const INTERVIEW_STAGES: PipelineStage[] = [
  PipelineStage.Interview,
  PipelineStage.HR,
  PipelineStage.Negotiation,
  PipelineStage.Offer,
  PipelineStage.Accepted,
];

export const OFFER_STAGES: PipelineStage[] = [PipelineStage.Offer, PipelineStage.Accepted];
