'use client';

import { SectionEyebrow } from '@/components/story-chapter-header';
import { JobsKanbanPreview } from '@/components/product-previews/jobs-kanban-preview';

export function CrmKanbanSection({ embedded = true }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-4xl text-center">
        <SectionEyebrow>Job CRM</SectionEyebrow>
        <h2
          data-cinematic-line
          className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Every application. Every stage. One view.
        </h2>
        <p data-cinematic-fade className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Drag roles from Saved to Offer — and always know exactly where you stand.
        </p>
      </div>

      <div
        data-cinematic-preview
        className="story-vertical-card mx-auto mt-14 max-w-5xl overflow-hidden will-change-transform sm:mt-16"
      >
        <JobsKanbanPreview />
      </div>
    </section>
  );
}
