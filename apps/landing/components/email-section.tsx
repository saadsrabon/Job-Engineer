'use client';

import { FeatureScreenshot } from '@/components/feature-screenshot';
import { SectionEyebrow } from '@/components/story-chapter-header';import { EmailPreview } from '@/components/product-previews/email-preview';

export function EmailSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div data-cinematic-preview className="order-2 story-vertical-card overflow-hidden lg:order-1">
          <EmailPreview />
        </div>
        <div className="order-1 lg:order-2">
          <SectionEyebrow>Email writer</SectionEyebrow>
          <h2
            data-cinematic-line
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Follow-ups that sound like you.
          </h2>
          <p data-cinematic-fade className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Recruiter outreach, thank-you notes, and negotiation emails — drafted in context of the
            job and your pipeline stage.
          </p>
          <div data-cinematic-reveal className="mt-8 overflow-hidden rounded-xl border border-border">
            <FeatureScreenshot
              src="/landing/features/email-writer.svg"
              alt="JobOS email writer screenshot"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
