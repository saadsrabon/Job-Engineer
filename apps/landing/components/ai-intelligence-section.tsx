'use client';

import { FeatureScreenshot } from '@/components/feature-screenshot';
import { SectionEyebrow } from '@/components/story-chapter-header';import { AiIntelligencePreview } from '@/components/product-previews/ai-intelligence-preview';

export function AiIntelligenceSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionEyebrow>AI intelligence</SectionEyebrow>
          <h2
            data-cinematic-line
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Every job, decoded.
          </h2>
          <p data-cinematic-fade className="mt-6 text-lg text-muted-foreground sm:text-xl">
            ATS scoring, job analysis, and cover letters — generated from your Career Library and
            the posting you are targeting.
          </p>
        </div>

        <div className="space-y-4">
          <div data-cinematic-preview className="story-vertical-card overflow-hidden">
            <AiIntelligencePreview />
          </div>
          <div data-cinematic-reveal className="overflow-hidden rounded-xl border border-border">
            <FeatureScreenshot
              src="/landing/features/ai-intelligence.svg"
              alt="JobOS AI intelligence — ATS score, job analysis, and cover letter"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
