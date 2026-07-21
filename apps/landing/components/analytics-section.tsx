'use client';

import { SectionEyebrow } from '@/components/story-chapter-header';
import { AnalyticsPreview } from '@/components/product-previews/analytics-preview';

export function AnalyticsSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full text-center">
        <SectionEyebrow>Analytics</SectionEyebrow>
        <h2
          data-cinematic-line
          className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Clarity replaces guesswork.
        </h2>
        <p data-cinematic-fade className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Response rates, interviews, offers — see what is working and where to focus next.
        </p>
      </div>

      <div data-cinematic-reveal className="mx-auto mt-10 max-w-4xl">
        <AnalyticsPreview />
      </div>
    </section>
  );
}

