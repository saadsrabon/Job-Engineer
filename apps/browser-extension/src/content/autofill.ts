import type { AutofillProfile } from '../lib/types';

interface FieldRule {
  keywords: string[];
  value?: string;
  preferTextarea?: boolean;
}

function fieldKey(element: HTMLElement) {
  const id = element.id || '';
  const name = 'name' in element ? String((element as HTMLInputElement).name || '') : '';
  const placeholder =
    'placeholder' in element ? String((element as HTMLInputElement).placeholder || '') : '';
  const aria = element.getAttribute('aria-label') || '';
  const autocomplete =
    'autocomplete' in element ? String((element as HTMLInputElement).autocomplete || '') : '';
  const label = element.closest('label')?.textContent || '';
  const labelledBy = element.getAttribute('aria-labelledby');
  const labelNode = labelledBy ? document.getElementById(labelledBy)?.textContent : '';
  return `${id} ${name} ${placeholder} ${aria} ${autocomplete} ${label} ${labelNode}`
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function matchesKeywords(key: string, keywords: string[]) {
  return keywords.some((keyword) => key.includes(keyword));
}

function setFieldValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  if (!value || element.disabled || element.readOnly) return false;
  if (element.value.trim() === value.trim()) return false;

  element.focus();
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function buildRules(profile: AutofillProfile): FieldRule[] {
  return [
    { keywords: ['email', 'e-mail'], value: profile.email },
    { keywords: ['first name', 'firstname', 'fname', 'given name', 'given-name'], value: profile.firstName },
    { keywords: ['last name', 'lastname', 'lname', 'family name', 'family-name', 'surname'], value: profile.lastName },
    { keywords: ['full name', 'fullname', 'name'], value: profile.fullName },
    { keywords: ['phone', 'mobile', 'telephone', 'tel'], value: profile.phone },
    { keywords: ['linkedin'], value: profile.linkedIn },
    { keywords: ['github'], value: profile.github },
    { keywords: ['portfolio', 'personal site', 'website', 'homepage'], value: profile.website },
    { keywords: ['location', 'city', 'address'], value: profile.location },
    { keywords: ['current title', 'job title', 'position title'], value: profile.currentTitle },
    { keywords: ['current company', 'employer', 'company name'], value: profile.currentCompany },
    { keywords: ['skills', 'skill'], value: profile.skills },
    { keywords: ['education', 'school', 'university', 'degree'], value: profile.education },
    {
      keywords: ['cover letter', 'coverletter', 'why do you', 'about you', 'summary', 'introduction'],
      value: profile.summary,
      preferTextarea: true,
    },
    {
      keywords: ['experience', 'employment', 'work history', 'background'],
      value: profile.workHistory,
      preferTextarea: true,
    },
  ];
}

export function autofillForm(profile: AutofillProfile) {
  const rules = buildRules(profile).filter((rule) => rule.value?.trim());
  const fields = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea',
    ),
  );

  let filled = 0;
  const used = new Set<HTMLElement>();

  for (const rule of rules) {
    const candidates = fields
      .filter((field) => !used.has(field))
      .filter((field) => (rule.preferTextarea ? field.tagName === 'TEXTAREA' || field.tagName === 'INPUT' : true))
      .filter((field) => matchesKeywords(fieldKey(field), rule.keywords));

    const target = candidates[0];
    if (target && rule.value && setFieldValue(target, rule.value)) {
      used.add(target);
      filled += 1;
    }
  }

  return filled;
}

export function isLikelyApplicationPage() {
  const haystack = document.body.innerText.toLowerCase();
  const keywords = ['apply now', 'submit application', 'upload resume', 'cover letter', 'work authorization'];
  return keywords.some((keyword) => haystack.includes(keyword));
}

function injectAutofillButton(onClick: () => void) {
  if (document.getElementById('jobos-autofill-btn')) return;

  const button = document.createElement('button');
  button.id = 'jobos-autofill-btn';
  button.type = 'button';
  button.textContent = 'Auto-fill with JobOS';
  button.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'z-index:2147483647',
    'padding:12px 16px',
    'border:none',
    'border-radius:999px',
    'background:#34d399',
    'color:#052e1f',
    'font:600 13px system-ui,sans-serif',
    'cursor:pointer',
    'box-shadow:0 10px 30px rgba(0,0,0,.25)',
  ].join(';');
  button.addEventListener('click', onClick);
  document.body.appendChild(button);
}

export function setupAutofillUi(runAutofill: () => Promise<{ filled: number }>) {
  if (!isLikelyApplicationPage()) return;

  injectAutofillButton(async () => {
    const { filled } = await runAutofill();
    const button = document.getElementById('jobos-autofill-btn');
    if (button) {
      button.textContent = filled > 0 ? `Filled ${filled} fields` : 'No matching fields found';
    }
  });
}
