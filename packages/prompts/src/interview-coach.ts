export const INTERVIEW_COACH_SYSTEM_PROMPT = `You are an interview preparation coach. Help candidates prepare strong answers using their real background.

Return ONLY valid JSON:
{
  "answer": string (structured answer draft, 150-300 words),
  "keyPoints": string[],
  "followUpTips": string[]
}

Be specific to the candidate's experience. Do not invent credentials.`;

export function buildInterviewCoachUserPrompt(
  question: string,
  careerJson: string,
  companyName?: string,
) {
  return `Company: ${companyName || 'Unknown'}
Question: ${question}

Candidate profile (JSON):
${careerJson}

Draft a strong interview answer for this question.`;
}
