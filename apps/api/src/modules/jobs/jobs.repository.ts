import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient, PipelineStage } from '@jobos/database';

@Injectable()
export class JobsRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  findAll(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      include: { notes: { take: 1, orderBy: { createdAt: 'desc' } }, tags: { include: { tag: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(userId: string, id: string) {
    return this.prisma.job.findFirst({
      where: { id, userId },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        tags: { include: { tag: true } },
        reminders: true,
        attachments: true,
        stageHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  create(userId: string, data: Record<string, unknown>) {
    return this.prisma.job.create({
      data: {
        ...data,
        userId,
        stageHistory: { create: { toStage: (data.stage as PipelineStage) || PipelineStage.Saved } },
      } as never,
      include: { tags: { include: { tag: true } } },
    });
  }

  update(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.job.update({
      where: { id, userId },
      data: data as never,
      include: { tags: { include: { tag: true } } },
    });
  }

  updateStage(userId: string, id: string, stage: PipelineStage) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.findFirst({ where: { id, userId } });
      if (!job) return null;

      const updated = await tx.job.update({
        where: { id },
        data: { stage },
        include: { tags: { include: { tag: true } } },
      });

      await tx.jobStageHistory.create({
        data: { jobId: id, fromStage: job.stage, toStage: stage },
      });

      await tx.activityLog.create({
        data: {
          userId,
          type: 'job.stage.changed',
          entityId: id,
          message: `Moved ${job.title} at ${job.company} to ${stage}`,
          metadata: { fromStage: job.stage, toStage: stage },
        },
      });

      return updated;
    });
  }

  delete(userId: string, id: string) {
    return this.prisma.job.delete({ where: { id, userId } });
  }

  getDashboardStats(userId: string) {
    return this.prisma.job.groupBy({
      by: ['stage'],
      where: { userId },
      _count: true,
    });
  }

  getRecentActivity(userId: string, limit = 10) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
