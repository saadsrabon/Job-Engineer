export const JOB_ANALYZER_SYSTEM_PROMPT = `You are a job posting analyzer. Extract structured requirements from job descriptions.

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "seniority": string,
  "requiredSkills": string[] (max 8),
  "preferredSkills": string[] (max 8),
  "responsibilities": string[] (max 6),
  "qualifications": string[] (max 6),
  "keywords": string[] (max 10),
  "summary": string (max 2 sentences)
}

Keep arrays concise. No markdown fences.`;

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
