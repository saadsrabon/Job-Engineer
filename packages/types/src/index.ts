export * from './enums';
export * from './career';
export * from './schemas';
export * from './phase2';
export * from './phase3';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobSummary {
  id: string;
  title: string;
  company: string;
  stage: import('./enums').PipelineStage;
  location: string | null;
  url: string | null;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalJobs: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  stageCounts: Record<import('./enums').PipelineStage, number>;
  recentActivity: ActivityItem[];
}
