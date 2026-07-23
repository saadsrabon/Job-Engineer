export const ATS_SCORER_SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) resume analyst. Score how well a candidate's career profile matches a job posting.

Return ONLY valid JSON with this exact shape:
{
  "score": number (0-100),
  "summary": string (max 2 sentences),
  "matchedSkills": string[] (max 5),
  "missingSkills": string[] (max 5),
  "matchedExperience": string[] (max 5),
  "gaps": string[] (max 5),
  "recommendations": string[] (max 5)
}

Be specific and actionable. Keep arrays short. No markdown fences.`;

export function buildAtsScorerUserPrompt(careerJson: string, job: { title: string; company: string; description: string | null }) {
  return `## Job Posting
Title: ${job.title}
Company: ${job.company}
Description:
${job.description || 'No description provided.'}

## Candidate Career Library (JSON)
${careerJson}

Score this candidate's fit for the job.`;
}
