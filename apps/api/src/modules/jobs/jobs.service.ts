import { Injectable, NotFoundException } from '@nestjs/common';
import { JobsRepository } from './jobs.repository';
import { PipelineStage } from '@jobos/database';

@Injectable()
export class JobsService {
  constructor(private repository: JobsRepository) {}

  findAll(userId: string) {
    return this.repository.findAll(userId);
  }

  findById(userId: string, id: string) {
    return this.repository.findById(userId, id);
  }

  create(userId: string, data: object) {
    return this.repository.create(userId, data as Record<string, unknown>);
  }

  update(userId: string, id: string, data: object) {
    return this.repository.update(userId, id, data as Record<string, unknown>);
  }

  async updateStage(userId: string, id: string, stage: PipelineStage) {
    const job = await this.repository.updateStage(userId, id, stage);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  delete(userId: string, id: string) {
    return this.repository.delete(userId, id);
  }

  async getDashboard(userId: string) {
    const [jobs, stageGroups, activity] = await Promise.all([
      this.repository.findAll(userId),
      this.repository.getDashboardStats(userId),
      this.repository.getRecentActivity(userId),
    ]);

    const stageCounts = Object.fromEntries(
      Object.values(PipelineStage).map((s) => [s, 0]),
    ) as Record<PipelineStage, number>;

    for (const group of stageGroups) {
      stageCounts[group.stage] = group._count;
    }

    const activeStages: PipelineStage[] = [
      PipelineStage.Applied,
      PipelineStage.Assessment,
      PipelineStage.Interview,
      PipelineStage.HR,
      PipelineStage.Negotiation,
    ];

    return {
      totalJobs: jobs.length,
      activeApplications: jobs.filter((j) => activeStages.includes(j.stage)).length,
      interviews: jobs.filter((j) => j.stage === PipelineStage.Interview).length,
      offers: jobs.filter((j) => j.stage === PipelineStage.Offer).length,
      stageCounts,
      recentActivity: activity,
    };
  }
}
