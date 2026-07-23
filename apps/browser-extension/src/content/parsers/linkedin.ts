import type { CapturedJob } from '../../lib/types';
import { extractGenericJob, firstText, text } from './generic';

function extractLinkedInDescription() {
  const selectors = [
    '#job-details',
    '.jobs-description__content',
    '.jobs-box__html-content',
    '.description__text',
    '[class*="jobs-description"]',
    '[class*="job-details"]',
  ];

  for (const selector of selectors) {
    const node = document.querySelector(selector);
    const value = node?.textContent?.replace(/\s+/g, ' ').trim();
    if (value && value.length > 80) return value.slice(0, 8000);
  }

  return undefined;
}

export function extractLinkedInJob(): CapturedJob | null {
  const url = window.location.href;
  const title = firstText([
    '.job-details-jobs-unified-top-card__job-title h1',
    '.jobs-unified-top-card__job-title',
    '.top-card-layout__title',
    'h1.t-24',
    'h1',
  ]);

  const company = firstText([
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '[data-test-job-company-name]',
  ]);

  const location = firstText([
    '.job-details-jobs-unified-top-card__tertiary-description-container',
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
  ]);

  const description = extractLinkedInDescription();

  if (!title) return extractGenericJob();

  return {
    title: title.slice(0, 200),
    company: (company || 'Unknown company').slice(0, 120),
    location: location?.slice(0, 120),
    url,
    description: description?.slice(0, 8000),
    source: 'linkedin',
  };
}

export function isLinkedInJobPage() {
  const host = window.location.hostname;
  const path = window.location.pathname;
  return host.includes('linkedin.com') && /\/jobs\/view\/|\/jobs\/collections\/|currentJobId=/.test(`${path}${window.location.search}`);
}
