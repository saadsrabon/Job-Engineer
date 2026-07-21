'use client';

import { SectionEyebrow } from '@/components/story-chapter-header';
import { ResumesPreview } from '@/components/product-previews/resumes-preview';

const STEPS = [
  { label: 'Upload resume', detail: 'PDF in' },
  { label: 'AI extracts', detail: 'Structured data' },
  { label: 'Career Library', detail: 'Reusable profile' },
  { label: 'Tailored PDF', detail: 'Generated out' },
];

export function ResumePipelineSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full">
        <SectionEyebrow>Resume intelligence</SectionEyebrow>
        <h2
          data-cinematic-line
          className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Upload once. Tailor forever.
        </h2>
        <p data-cinematic-fade className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          AI extracts your experience into a Career Library — the single source of truth behind
          every resume you send.
        </p>

        <div className="mt-12 grid w-full gap-8 lg:grid-cols-2 lg:items-start">
          <div data-cinematic-reveal className="story-card-stack space-y-4">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className="story-step-card story-vertical-card flex items-center gap-4 p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold landing-accent-text">
                  {i + 1}
                </span>
                <div className="text-left">
                  <p className="font-medium">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div data-cinematic-preview className="story-vertical-card overflow-hidden">
            <ResumesPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
