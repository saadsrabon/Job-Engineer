'use client';

import { FeatureScreenshot } from '@/components/feature-screenshot';
import { SectionEyebrow } from '@/components/story-chapter-header';

export function ExtensionSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionEyebrow>Browser extension</SectionEyebrow>
          <h2
            data-cinematic-line
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Capture jobs without leaving the tab.
          </h2>
          <p data-cinematic-fade className="mt-6 text-lg text-muted-foreground sm:text-xl">
            One click saves title, company, and description straight into your JobOS pipeline —
            no copy-paste, no lost postings.
          </p>
        </div>
        <div data-cinematic-reveal className="overflow-hidden rounded-xl border border-border shadow-2xl">
          <FeatureScreenshot
            src="/landing/features/browser-extension.svg"
            alt="JobOS browser extension capturing a job posting"
          />
        </div>
      </div>
    </section>
  );
}
