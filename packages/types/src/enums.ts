export enum PipelineStage {
  Saved = 'Saved',
  Interested = 'Interested',
  Researching = 'Researching',
  ResumeReady = 'ResumeReady',
  Applied = 'Applied',
  Assessment = 'Assessment',
  Interview = 'Interview',
  HR = 'HR',
  Negotiation = 'Negotiation',
  Offer = 'Offer',
  Rejected = 'Rejected',
  Accepted = 'Accepted',
  Archived = 'Archived',
}

export const PIPELINE_STAGES = Object.values(PipelineStage);

export enum ParseJobStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
}

export enum AiAgent {
  ResumeParser = 'resume-parser',
  CoverLetter = 'cover-letter',
  JobAnalyzer = 'job-analyzer',
  AtsScorer = 'ats-scorer',
  InterviewCoach = 'interview-coach',
  EmailWriter = 'email-writer',
  AnswerGenerator = 'answer-generator',
  ProfileImprover = 'profile-improver',
  SkillGapAnalyzer = 'skill-gap-analyzer',
  CareerAdvisor = 'career-advisor',
}
