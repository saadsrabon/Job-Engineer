'use client';

import { SectionEyebrow } from '@/components/story-chapter-header';
import { Check, X } from 'lucide-react';

const PAIN_POINTS = [
  'Applications scattered across spreadsheets and browser tabs',
  'Rewriting the same resume for every role from scratch',
  'Interview prep buried in bookmarks and random notes',
  'No clear picture of where each application stands',
  'Follow-up emails written at midnight, one at a time',
];

const SOLUTIONS = [
  'One dashboard for every job, stage, and next step',
  'Career Library — upload once, tailor resumes in minutes',
  'Company-specific questions and AI coaching in one workspace',
  '13-stage pipeline from Saved to Offer, always visible',
  'Smart email drafts tied to the job you are actually pursuing',
];

export function CompareSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <SectionEyebrow className="landing-accent-text">Sound familiar?</SectionEyebrow>

      <div
        data-cinematic-stack
        className="cinematic-statement-stack relative mt-6 min-h-[6.5rem] sm:min-h-[7.5rem] lg:min-h-[8.5rem]"
      >
        <p
          data-stack-line
          className="cinematic-stack-line text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Spreadsheets are chaos.
        </p>
        <p
          data-stack-line
          className="cinematic-stack-line text-3xl font-semibold tracking-tight text-muted-foreground sm:text-4xl lg:text-5xl"
        >
          Five tools. Zero clarity.
        </p>
        <p
          data-stack-line
          className="cinematic-stack-line text-3xl font-semibold tracking-tight landing-accent-text sm:text-4xl lg:text-5xl"
        >
          JobOS is one calm workspace.
        </p>
      </div>

      <p data-cinematic-fade className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Can you relate to the left column? That is exactly why we built one calm workspace on the
        right.
      </p>

      <div data-cinematic-reveal className="story-card-stack mt-12 lg:grid lg:grid-cols-2 lg:gap-6">
        <div data-panel="pain" className="story-vertical-card p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Without JobOS
          </p>
          <ul className="mt-6 space-y-4">
            {PAIN_POINTS.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                  <X className="h-3 w-3 text-destructive" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div data-panel="solution" className="story-vertical-card border-emerald-500/20 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-widest landing-accent-text">
            With JobOS
          </p>
          <ul className="mt-6 space-y-4">
            {SOLUTIONS.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-3 w-3 text-emerald-400" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
