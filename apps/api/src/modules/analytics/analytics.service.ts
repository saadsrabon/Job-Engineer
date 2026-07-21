import { Injectable, Inject } from '@nestjs/common';
import { PipelineStage } from '@jobos/database';
import {
  AnalyticsRepository,
  APPLIED_STAGES,
  INTERVIEW_STAGES,
  OFFER_STAGES,
} from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(AnalyticsRepository) private repository: AnalyticsRepository) {}

  async getOverview(userId: string) {
    const [jobs, stageHistory] = await Promise.all([
      this.repository.getJobs(userId),
      this.repository.getStageHistory(userId),
    ]);
    const totalJobs = jobs.length;

    const applied = jobs.filter((j) => APPLIED_STAGES.includes(j.stage)).length;
    const interviews = jobs.filter((j) => INTERVIEW_STAGES.includes(j.stage)).length;
    const offers = jobs.filter((j) => OFFER_STAGES.includes(j.stage)).length;

    const funnel = Object.values(PipelineStage).map((stage) => ({
      stage,
      count: jobs.filter((j) => j.stage === stage).length,
    }));

    const responseRate = totalJobs > 0 ? Math.round((applied / totalJobs) * 100) : 0;
    const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
    const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    const weeklyActivity = buildWeeklyActivity(jobs, stageHistory);

    return {
      totalJobs,
      applied,
      interviews,
      offers,
      responseRate,
      interviewRate,
      offerRate,
      funnel,
      weeklyActivity,
    };
  }
}

function buildWeeklyActivity(
  jobs: Array<{ createdAt: Date; stage: PipelineStage }>,
  stageHistory: Array<{ toStage: PipelineStage; createdAt: Date }>,
) {
  const buckets = new Map<string, { applications: number; interviews: number }>();

  for (const job of jobs) {
    const week = weekKey(job.createdAt);
    const entry = buckets.get(week) ?? { applications: 0, interviews: 0 };
    entry.applications += 1;
    buckets.set(week, entry);
  }

  for (const event of stageHistory) {
    if (!INTERVIEW_STAGES.includes(event.toStage)) continue;
    const week = weekKey(event.createdAt);
    const entry = buckets.get(week) ?? { applications: 0, interviews: 0 };
    entry.interviews += 1;
    buckets.set(week, entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, stats]) => ({ week, ...stats }));
}

function weekKey(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
