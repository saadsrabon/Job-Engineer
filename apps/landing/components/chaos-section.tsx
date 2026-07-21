'use client';

import { useEffect, useRef } from 'react';

const TABS = ['Excel', 'Resume.pdf', 'LinkedIn', 'Indeed', 'Gmail', 'ChatGPT', 'Notion', 'Calendar'];

export function ChaosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current || !tabsRef.current) return;

    let ctx: { revert: () => void } | undefined;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          const tabs = tabsRef.current!.children;
          gsap.fromTo(
            tabs,
            { opacity: 0, y: 0, scale: 1 },
            {
              opacity: 1,
              y: (i) => (i % 2 === 0 ? -80 - i * 20 : 80 + i * 15),
              x: (i) => (i % 3 === 0 ? -120 : i % 3 === 1 ? 100 : -40 + i * 30),
              scale: 0.9,
              stagger: 0.08,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 1,
              },
            },
          );
        }, sectionRef);
      },
    );

    return () => ctx?.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Everything scattered.</h2>
        <p className="mt-4 text-muted-foreground">
          Tabs everywhere. Spreadsheets. PDFs. Notes in five different apps.
        </p>
      </div>
      <div
        ref={tabsRef}
        className="relative mx-auto mt-16 flex h-96 max-w-2xl flex-wrap items-center justify-center gap-4"
      >
        {TABS.map((tab) => (
          <div
            key={tab}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm"
          >
            {tab}
          </div>
        ))}
      </div>
    </section>
  );
}
