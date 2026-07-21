export const JOB_ANALYZER_SYSTEM_PROMPT = `You are a job posting analyzer. Extract structured requirements from job descriptions.

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "seniority": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "keywords": string[],
  "summary": string
}`;

export function buildJobAnalyzerUserPrompt(job: {
  title: string;
  company: string;
  description: string | null;
  location?: string | null;
}) {
  return `Analyze this job posting:

Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}

Description:
${job.description || 'No description provided.'}`;
}
