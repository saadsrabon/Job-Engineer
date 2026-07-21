'use client';

import { DashboardPreview } from '@/components/product-previews/dashboard-preview';

const TABS = [
  { id: 'excel', label: 'Excel', navTarget: 'dashboard' },
  { id: 'resume', label: 'Resume.pdf', navTarget: 'resumes' },
  { id: 'linkedin', label: 'LinkedIn', navTarget: 'career' },
  { id: 'indeed', label: 'Indeed', navTarget: 'jobs' },
  { id: 'gmail', label: 'Gmail', navTarget: 'interviews' },
  { id: 'chatgpt', label: 'ChatGPT', navTarget: null },
  { id: 'notion', label: 'Notion', navTarget: null },
  { id: 'calendar', label: 'Calendar', navTarget: null },
];

export function ConvergenceSection() {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-4xl text-center">
        <p
          data-cinematic-line
          className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
        >
          Right now, your search lives everywhere.
        </p>
        <p
          data-cinematic-line
          className="text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl lg:text-4xl"
        >
          Spreadsheets. PDFs. Inboxes. Notes. Nothing talks to each other.
        </p>
        <h2
          data-cinematic-line
          className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Watch the chaos collapse into one dashboard.
        </h2>
      </div>

      <div
        data-convergence-stage
        className="relative mx-auto mt-10 flex h-[min(480px,48vh)] w-full max-w-5xl items-center justify-center sm:mt-12"
      >
        <div data-convergence-tabs className="pointer-events-none absolute inset-0">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              data-nav-target={tab.navTarget ?? undefined}
              className="tab-chip absolute rounded-full bg-card/95 px-4 py-2 text-xs font-semibold shadow-lg will-change-transform sm:text-sm"
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div data-convergence-dashboard className="relative z-10 w-full will-change-transform">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
