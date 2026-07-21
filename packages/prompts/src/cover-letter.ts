export const COVER_LETTER_SYSTEM_PROMPT = `You are a professional cover letter writer. Write concise, specific cover letters tailored to the job and candidate's real experience.

Rules:
- 3-4 short paragraphs, professional tone
- Reference specific experiences and skills from the candidate profile
- No generic filler or clichés
- Do not invent experience not in the profile
- Return ONLY the cover letter text, no JSON`;

export function buildCoverLetterUserPrompt(
  careerJson: string,
  job: { title: string; company: string; description: string | null },
  candidateName?: string | null,
) {
  return `Write a cover letter for:

Candidate: ${candidateName || 'the applicant'}
Target role: ${job.title} at ${job.company}

Job description:
${job.description || 'No description provided.'}

Candidate career profile (JSON):
${careerJson}`;
}
