const RESUME_MAX_CHARS = 8000;

const SECTION_HEADERS = new Set([
  'summary',
  'profile',
  'about',
  'objective',
  'experience',
  'work experience',
  'professional experience',
  'employment',
  'employment history',
  'work history',
  'education',
  'academic background',
  'skills',
  'technical skills',
  'core competencies',
  'technologies',
  'projects',
  'certifications',
  'certificates',
  'licenses',
  'awards',
  'honors',
  'achievements',
  'languages',
  'volunteer',
  'volunteer experience',
  'publications',
  'interests',
  'references',
  'contact',
]);

const SECTION_KEYWORDS = [
  'experience',
  'education',
  'skills',
  'projects',
  'certification',
  'certificate',
  'award',
  'language',
  'volunteer',
  'publication',
  'summary',
  'profile',
  'objective',
  'employment',
  'competenc',
  'technolog',
  'reference',
  'contact',
  'honor',
  'achievement',
  'license',
  'interest',
];

function cleanPdfText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/(\w)-\n(\w)/g, '$1$2')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeHeaderLine(line: string): string {
  return line
    .replace(/:$/, '')
    .replace(/^#+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSectionHeader(line: string): boolean {
  const normalized = normalizeHeaderLine(line).toLowerCase();
  if (SECTION_HEADERS.has(normalized)) return true;

  const withoutParens = normalized.replace(/\([^)]*\)/g, '').trim();
  if (SECTION_HEADERS.has(withoutParens)) return true;

  if (
    line.length >= 3 &&
    line.length <= 48 &&
    line === line.toUpperCase() &&
    /[A-Z]/.test(line) &&
    !/\d{4}/.test(line) &&
    SECTION_KEYWORDS.some((keyword) => normalized.includes(keyword))
  ) {
    return true;
  }

  return false;
}

function isBulletLine(line: string): boolean {
  return /^([•●▪◦\-–—*]|\d+[.)])\s+/.test(line);
}

function toBullet(line: string): string {
  return line.replace(/^([•●▪◦\-–—*]|\d+[.)])\s+/, '').trim();
}

function titleCaseSection(line: string): string {
  const normalized = normalizeHeaderLine(line);
  if (normalized === normalized.toUpperCase()) {
    return normalized
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return normalized;
}

export function formatResumeTextToMarkdown(rawText: string): string {
  const cleaned = cleanPdfText(rawText);
  if (!cleaned) return '';

  const lines = cleaned.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      continue;
    }

    if (isSectionHeader(trimmed)) {
      result.push(`## ${titleCaseSection(trimmed)}`);
      continue;
    }

    if (isBulletLine(trimmed)) {
      result.push(`- ${toBullet(trimmed)}`);
      continue;
    }

    result.push(trimmed);
  }

  return truncateResumeMarkdown(result.join('\n'));
}

export function truncateResumeMarkdown(
  text: string,
  maxLength = RESUME_MAX_CHARS,
): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSection = truncated.lastIndexOf('\n## ');

  if (lastSection > maxLength * 0.65) {
    return `${truncated.slice(0, lastSection).trimEnd()}\n\n[Truncated for length]`;
  }

  const lastParagraph = truncated.lastIndexOf('\n\n');
  if (lastParagraph > maxLength * 0.8) {
    return `${truncated.slice(0, lastParagraph).trimEnd()}\n\n[Truncated for length]`;
  }

  return `${truncated.trimEnd()}\n\n[Truncated for length]`;
}
