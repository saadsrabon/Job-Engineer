import type { CapturedJob } from '../../lib/types';
import { extractGenericJob, firstText } from './generic';

function extractIndeedDescription() {
  const node =
    document.querySelector('#jobDescriptionText') ||
    document.querySelector('[data-testid="jobDescriptionText"]') ||
    document.querySelector('.jobsearch-JobComponent-description');

  return node?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 8000) || undefined;
}

export function extractIndeedJob(): CapturedJob | null {
  const url = window.location.href;
  const title = firstText([
    'h1[data-testid="jobsearch-JobInfoHeader-title"]',
    '.jobsearch-JobInfoHeader-title',
    'h1.jobsearch-JobInfoHeader-title',
    'h1',
  ])?.replace(/^hiring\s+/i, '');

  const company = firstText([
    '[data-testid="inlineHeader-companyName"]',
    '[data-company-name="true"]',
    '.jobsearch-CompanyInfoWithoutHeaderImage a',
    '.jobsearch-InlineCompanyRating a',
  ]);

  const location = firstText([
    '[data-testid="job-location"]',
    '[data-testid="inlineHeader-companyLocation"]',
    '.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)',
  ]);

  const description = extractIndeedDescription();

  if (!title) return extractGenericJob();

  return {
    title: title.slice(0, 200),
    company: (company || 'Unknown company').slice(0, 120),
    location: location?.slice(0, 120),
    url,
    description: description?.slice(0, 8000),
    source: 'indeed',
  };
}

export function isIndeedJobPage() {
  const host = window.location.hostname;
  const path = window.location.pathname;
  return host.includes('indeed.') && (path.includes('/viewjob') || path.includes('/rc/clk') || path.includes('/job/'));
}
