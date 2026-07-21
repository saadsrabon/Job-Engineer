'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@jobos/ui';
import { SectionEyebrow } from '@/components/story-chapter-header';

const FAQ_ITEMS = [
  {
    q: 'What is JobOS?',
    a: 'JobOS is a career operating system — one place for your resume, job pipeline, interview prep, and offer tracking. Instead of juggling spreadsheets and scattered tools, everything connects.',
  },
  {
    q: 'How is this different from a spreadsheet or Notion template?',
    a: 'Templates still require manual upkeep. JobOS parses your resume into a structured Career Library, tracks jobs through 13 pipeline stages, surfaces company interview questions, and drafts emails — automatically tied to each role.',
  },
  {
    q: 'Does AI write my resume for me?',
    a: 'No — you stay in control. AI extracts structure from your PDF, scores ATS fit, and helps tailor output. Your experience and voice remain yours; JobOS removes the repetitive assembly work.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your account is protected with Clerk authentication. Career data and job records are stored in your private workspace — not shared across users or used to train public models.',
  },
  {
    q: 'Can I export resumes to PDF?',
    a: 'Yes. Once your Career Library is populated, generate tailored PDF resumes directly from the dashboard — formatted and ready to send.',
  },
  {
    q: 'Who is JobOS built for?',
    a: 'Anyone running a serious job search — especially developers and professionals who want clarity over chaos. Interview prep includes company-specific questions sourced from the Interview BD community dataset.',
  },
];

export function FaqSection({ embedded = false }: { embedded?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full">
        <SectionEyebrow>FAQ</SectionEyebrow>
        <h2
          data-cinematic-line
          className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Can&apos;t find your answer?
        </h2>
        <p data-cinematic-fade className="mt-4 max-w-xl text-muted-foreground sm:text-lg">
          We are here to help. Here is what people ask before they get started.
        </p>

        <div data-cinematic-reveal className="story-card-stack mt-12 max-w-3xl">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.q}
                className={cn(
                  'story-vertical-card transition-colors',
                  isOpen && 'faq-item-open border-emerald-500/20',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'faq-chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300',
                      isOpen && 'text-emerald-400',
                    )}
                  />
                </button>
                <div className="faq-answer px-5 sm:px-6">
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
