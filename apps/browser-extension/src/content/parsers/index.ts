import type { CapturedJob } from '../../lib/types';
import { extractGenericJob } from './generic';
import { extractIndeedJob, isIndeedJobPage } from './indeed';
import { extractLinkedInJob, isLinkedInJobPage } from './linkedin';

export async function extractJobFromPage(): Promise<CapturedJob | null> {
  if (isLinkedInJobPage()) return extractLinkedInJob();
  if (isIndeedJobPage()) return extractIndeedJob();
  return extractGenericJob();
}

export type { CapturedJob };
