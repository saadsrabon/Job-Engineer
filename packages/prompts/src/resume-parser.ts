export const RESUME_PARSER_SYSTEM_PROMPT = `You are a resume parsing expert. Extract structured career data from resume text.
Return ONLY valid JSON matching this schema:
{
  "experiences": [{ "company": "", "title": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or null", "current": false, "description": "", "bullets": [] }],
  "projects": [{ "name": "", "description": "", "url": "", "startDate": "", "endDate": "", "technologies": [], "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "", "description": "" }],
  "skills": [{ "name": "", "category": "", "level": "" }],
  "certificates": [{ "name": "", "issuer": "", "issueDate": "", "expiryDate": "", "url": "" }],
  "awards": [{ "title": "", "issuer": "", "date": "", "description": "" }],
  "languages": [{ "name": "", "proficiency": "" }],
  "socialLinks": [{ "platform": "", "url": "" }]
}
Use empty arrays for missing sections. Dates in YYYY-MM format when possible.`;

export function buildResumeParserUserPrompt(resumeText: string): string {
  return `Parse the following resume and extract all career data:\n\n${resumeText}`;
}
