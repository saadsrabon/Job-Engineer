'use client';

import { useEffect, useState } from 'react';
import { cn } from '@jobos/ui';
import { loadGsap, prefersReducedMotion } from '@/lib/motion';

const SECTIONS = [
  'intro',
  'problem',
  'relate',
  'profile',
  'ai',
  'pipeline',
  'prep',
  'email',
  'progress',
  'extension',
  'outcome',
  'faq',
];

export function StoryProgressRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let triggers: Array<{ kill: () => void }> = [];

    loadGsap().then(({ ScrollTrigger }) => {
      SECTIONS.forEach((id, index) => {
        const el = document.getElementById(`story-${id}`);
        if (!el) return;

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        });

        triggers.push(trigger);
      });
    });

    return () => {
      triggers.forEach((t) => t.kill());
      triggers = [];
    };
  }, []);

  return (
    <div
      className="story-progress-rail pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:left-8"
      aria-hidden
    >
      <div className="flex flex-col gap-2.5">
        {SECTIONS.map((id, index) => (
          <span
            key={id}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              index === active
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                : index < active
                  ? 'bg-emerald-600/50'
                  : 'bg-emerald-950/60',
            )}
          />
        ))}
      </div>
    </div>
  );
}
