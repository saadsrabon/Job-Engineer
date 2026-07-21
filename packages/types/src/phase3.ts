export interface AnalyticsOverview {
  totalJobs: number;
  applied: number;
  interviews: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  funnel: Array<{ stage: string; count: number }>;
  weeklyActivity: Array<{ week: string; applications: number; interviews: number }>;
}

export interface JobReminderItem {
  id: string;
  jobId: string;
  title: string;
  dueAt: string;
  completed: boolean;
  job?: { id: string; title: string; company: string; stage: string };
}

export interface InterviewRoundItem {
  id: string;
  jobId: string;
  title: string;
  scheduledAt: string | null;
  location: string | null;
  prepNotes: string | null;
  feedback: string | null;
  status: string;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewProgressStats {
  practiced: number;
  totalQuestions: number;
  companiesStarted: number;
}

export interface AdminOverview {
  users: number;
  jobs: number;
  interviewCompanies: number;
  interviewQuestions: number;
  syncMeta: { commitSha: string | null; syncedAt: string } | null;
  aiModels: Array<{ agent: string; modelId: string; enabled: boolean }>;
  aiGenerations: number;
}

export interface CapturedJobPayload {
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
}
