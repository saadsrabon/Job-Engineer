/**
 * Company name → interview data slug aliases.
 * Used to match Job CRM company names to Interview BD slugs.
 */
export const COMPANY_ALIASES: Record<string, string> = {
  bkash: 'bkash',
  'b kash': 'bkash',
  pathao: 'pathao',
  chaldal: 'chaldal',
  'brain station 23': 'bs23',
  'brainstation 23': 'bs23',
  bs23: 'bs23',
  enosis: 'enosis',
  'reve systems': 'revesystems',
  revesystems: 'revesystems',
  rokomari: 'rokomari',
  shopup: 'shopup',
  wedevs: 'wedevs',
  optimizely: 'optimizely',
  kite: 'kite',
  synesis: 'synesis',
  welldev: 'welldev',
  exabyting: 'exabyting',
  fringecore: 'fringecore',
  relisource: 'relisource',
  orbitax: 'orbitax',
  iqvia: 'iqvia',
  priyo: 'priyo',
  shellbeehaken: 'shellbeehaken',
  appscode: 'appscode',
  inverseai: 'inverseai',
  appifylab: 'appifylab',
};

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveCompanySlug(companyName: string, knownSlugs: string[]): string | null {
  const normalized = normalizeCompanyName(companyName);
  if (!normalized) return null;

  if (COMPANY_ALIASES[normalized]) return COMPANY_ALIASES[normalized];

  for (const [alias, slug] of Object.entries(COMPANY_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) return slug;
  }

  const slugCandidate = normalized.replace(/\s+/g, '');
  if (knownSlugs.includes(slugCandidate)) return slugCandidate;

  for (const slug of knownSlugs) {
    if (normalized.includes(slug) || slug.includes(normalized.replace(/\s/g, ''))) {
      return slug;
    }
  }

  return null;
}
