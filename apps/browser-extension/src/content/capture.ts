export interface CapturedJob {
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
}

export async function extractJobFromPage(): Promise<CapturedJob | null> {
  const url = window.location.href;
  const title =
    document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.title.split('|')[0]?.trim() ||
    '';

  const company =
    document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
    document.querySelector('[data-company]')?.textContent?.trim() ||
    guessCompanyFromTitle(document.title) ||
    'Unknown company';

  const description =
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    extractMainText();

  const location =
    document.querySelector('[data-location]')?.textContent?.trim() ||
    document.querySelector('.location')?.textContent?.trim() ||
    undefined;

  if (!title) return null;

  return {
    title: title.slice(0, 200),
    company: company.slice(0, 120),
    location: location?.slice(0, 120),
    url,
    description: description?.slice(0, 8000),
  };
}

function guessCompanyFromTitle(pageTitle: string) {
  const parts = pageTitle.split(/[-|·]/).map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'Unknown company';
}

function extractMainText() {
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const target = article || main || document.body;
  return target?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 4000) || undefined;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CAPTURE_JOB') {
    extractJobFromPage().then((job) => sendResponse({ job }));
    return true;
  }
  return false;
});
