'use client';

import { FeatureScreenshot } from '@/components/feature-screenshot';
import { SectionEyebrow } from '@/components/story-chapter-header';
import { InterviewsPreview } from '@/components/product-previews/interviews-preview';

export function InterviewSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionEyebrow>Interview prep</SectionEyebrow>
          <h2
            data-cinematic-line
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            The questions show up.
          </h2>
          <h2
            data-cinematic-line
            className="text-3xl font-semibold tracking-tight text-muted-foreground sm:text-4xl lg:text-5xl"
          >
            Your answers get sharper.
          </h2>
          <p data-cinematic-fade className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Company question banks, AI coaching, interview rounds, and prep notes — in the same
            workspace as the job you are preparing for.
          </p>
        </div>

        <div className="space-y-4">
          <div data-cinematic-preview className="story-vertical-card overflow-hidden">
            <InterviewsPreview />
          </div>
          <div data-cinematic-reveal className="overflow-hidden rounded-xl border border-border">
            <FeatureScreenshot
              src="/landing/features/interview-workspace.svg"
              alt="JobOS interview workspace with scheduled rounds"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
