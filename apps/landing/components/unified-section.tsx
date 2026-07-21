'use client';

import { useEffect, useRef } from 'react';

export function UnifiedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current || !dashboardRef.current) return;

    let ctx: { revert: () => void } | undefined;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.fromTo(
            dashboardRef.current,
            { opacity: 0, scale: 0.85, y: 40 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
                end: 'center center',
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
    <section ref={sectionRef} className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Everything finally lives in one place.</h2>
        <p className="mt-4 text-muted-foreground">Meet JobOS — your career command center.</p>
      </div>

      <div ref={dashboardRef} className="mx-auto mt-16 max-w-4xl">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex h-10 items-center gap-2 border-b border-border px-4">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <div className="grid grid-cols-4 gap-4 p-6">
            <div className="col-span-1 space-y-2">
              <div className="h-8 rounded-lg bg-muted" />
              <div className="h-8 rounded-lg bg-primary/20" />
              <div className="h-8 rounded-lg bg-muted" />
              <div className="h-8 rounded-lg bg-muted" />
            </div>
            <div className="col-span-3 grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-border bg-muted/50 p-3">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
