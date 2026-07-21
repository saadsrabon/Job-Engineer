export const ATS_SCORER_SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) resume analyst. Score how well a candidate's career profile matches a job posting.

Return ONLY valid JSON with this exact shape:
{
  "score": number (0-100),
  "summary": string (2-3 sentences),
  "matchedSkills": string[],
  "missingSkills": string[],
  "matchedExperience": string[],
  "gaps": string[],
  "recommendations": string[]
}

Be specific and actionable. Base scores on keyword overlap, relevant experience, and skill alignment — not fluff.`;

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
