import type { CapturedJob } from '../../lib/types';

function text(selector: string, root: ParentNode = document): string | undefined {
  const node = root.querySelector(selector);
  const value = node?.textContent?.replace(/\s+/g, ' ').trim();
  return value || undefined;
}

function attr(selector: string, name: string): string | undefined {
  return document.querySelector(selector)?.getAttribute(name)?.trim() || undefined;
}

function firstText(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = text(selector);
    if (value) return value;
  }
  return undefined;
}

function guessCompanyFromTitle(pageTitle: string) {
  const parts = pageTitle.split(/[-|·]/).map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1]! : parts[0] || 'Unknown company';
}

function extractMainText() {
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const target = article || main || document.body;
  return target?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 4000) || undefined;
}

export function extractGenericJob(): CapturedJob | null {
  const url = window.location.href;
  const title =
    attr('meta[property="og:title"]', 'content') ||
    firstText(['h1']) ||
    document.title.split('|')[0]?.trim() ||
    '';

  const company =
    attr('meta[property="og:site_name"]', 'content') ||
    firstText(['[data-company]', '[data-testid*="company"]']) ||
    guessCompanyFromTitle(document.title) ||
    'Unknown company';

  const description =
    attr('meta[name="description"]', 'content') ||
    attr('meta[property="og:description"]', 'content') ||
    extractMainText();

  const location =
    firstText(['[data-location]', '.location', '[data-testid*="location"]']) || undefined;

  if (!title) return null;

  return {
    title: title.slice(0, 200),
    company: company.slice(0, 120),
    location: location?.slice(0, 120),
    url,
    description: description?.slice(0, 8000),
    source: 'generic',
  };
}

export { guessCompanyFromTitle, extractMainText, firstText, text, attr };
