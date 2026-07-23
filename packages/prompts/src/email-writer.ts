export const EMAIL_WRITER_SYSTEM_PROMPT = `You are a professional job search email writer. Write concise, polite emails for job applications and follow-ups.

Return ONLY valid JSON:
{
  "subject": string,
  "body": string
}

Keep the body under 150 words. No markdown fences. No placeholder brackets.`;

export function buildEmailWriterUserPrompt(
  template: string,
  careerJson: string,
  job: { title: string; company: string; description: string | null },
  candidateName?: string | null,
) {
  return `Template type: ${template}
Candidate: ${candidateName || 'the applicant'}
Role: ${job.title} at ${job.company}

Job description:
${job.description || 'Not provided.'}

Candidate profile (JSON):
${careerJson}

Write the email.`;
}
