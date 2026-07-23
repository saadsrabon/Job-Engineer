export interface CapturedJob {
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
  source?: string;
}

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  url?: string | null;
}

export interface AutofillProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  currentTitle?: string;
  currentCompany?: string;
  skills?: string;
  education?: string;
  summary?: string;
  workHistory?: string;
}

export interface CareerLibraryData {
  experiences: Array<{
    company: string;
    title: string;
    location?: string | null;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    description?: string | null;
    bullets?: string[];
  }>;
  projects: Array<{
    name: string;
    description?: string | null;
    url?: string | null;
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string | null;
    endDate?: string | null;
  }>;
  skills: Array<{ name: string; category?: string | null }>;
  socialLinks: Array<{ platform: string; url: string }>;
}

export interface UserProfile {
  name?: string | null;
  email: string;
}

export interface AtsScoreResult {
  score: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience: string[];
  gaps: string[];
  recommendations: string[];
}

export interface JobAnalyzerResult {
  title: string;
  seniority: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
  summary: string;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string | null;
  topics: string[];
}

export interface JobSuggestedQuestions {
  job: { id: string; company: string; title: string };
  matchedCompany: { slug: string; name: string; questionCount: number } | null;
  questions: SuggestedQuestion[];
}

export interface GeneratedEmail {
  template: { id: string; name: string; description: string };
  subject: string;
  body: string;
}

export interface AiProviderInfo {
  provider: 'openrouter' | 'custom';
  baseUrlHost: string;
  defaultModel: string;
  configured: boolean;
}

export interface JobAssistantResult {
  job: SavedJob;
  ats?: AtsScoreResult;
  analysis?: JobAnalyzerResult;
  coverLetter: string;
  email: GeneratedEmail;
  questions: JobSuggestedQuestions;
  errors?: string[];
}
