export interface InterviewCompanySummary {
  id: string;
  slug: string;
  name: string;
  topics: string[];
  sourceUrl: string | null;
  _count?: { questions: number };
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  answer: string | null;
  topics: string[];
  externalUrl: string | null;
  verified: boolean;
  company?: { slug: string; name: string } | null;
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

export interface JobSuggestedQuestions {
  job: { id: string; company: string; title: string };
  matchedCompany: { slug: string; name: string; questionCount: number } | null;
  questions: InterviewQuestionItem[];
}
