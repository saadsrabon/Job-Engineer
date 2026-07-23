import type { AutofillProfile, CareerLibraryData, UserProfile } from './types';

function splitName(fullName?: string | null) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' };
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(' '),
  };
}

function findSocialUrl(links: CareerLibraryData['socialLinks'], platforms: string[]) {
  const match = links.find((link) =>
    platforms.some((platform) => link.platform.toLowerCase().includes(platform)),
  );
  return match?.url;
}

function formatExperience(exp: CareerLibraryData['experiences'][number]) {
  const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
  const bullets = exp.bullets?.length ? `\n${exp.bullets.map((b) => `• ${b}`).join('\n')}` : '';
  const body = exp.description || bullets;
  return `${exp.title} at ${exp.company} (${dates})${body ? `\n${body}` : ''}`;
}

export function buildAutofillProfile(
  user: UserProfile,
  career: CareerLibraryData,
): AutofillProfile {
  const { firstName, lastName } = splitName(user.name);
  const currentExperience =
    career.experiences.find((exp) => exp.current) || career.experiences[0];
  const latestEducation = career.education[0];
  const skills = career.skills.map((skill) => skill.name).join(', ');
  const linkedIn = findSocialUrl(career.socialLinks, ['linkedin']);
  const github = findSocialUrl(career.socialLinks, ['github']);
  const website = findSocialUrl(career.socialLinks, [
    'portfolio',
    'website',
    'personal',
    'blog',
  ]);

  const workHistory = career.experiences.slice(0, 4).map(formatExperience).join('\n\n');
  const education = latestEducation
    ? `${latestEducation.degree}${latestEducation.field ? ` in ${latestEducation.field}` : ''}, ${latestEducation.institution}`
    : undefined;

  const summaryParts = [
    currentExperience
      ? `${currentExperience.title} with experience at ${currentExperience.company}.`
      : '',
    skills ? `Skills: ${skills}.` : '',
  ].filter(Boolean);

  return {
    firstName,
    lastName,
    fullName: user.name?.trim() || `${firstName} ${lastName}`.trim() || user.email,
    email: user.email,
    location: currentExperience?.location || undefined,
    linkedIn,
    github,
    website: website || career.projects.find((p) => p.url)?.url || undefined,
    currentTitle: currentExperience?.title,
    currentCompany: currentExperience?.company,
    skills: skills || undefined,
    education,
    summary: summaryParts.join(' ') || undefined,
    workHistory: workHistory || undefined,
  };
}
