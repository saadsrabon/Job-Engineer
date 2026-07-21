'use client';

import { cn } from '@jobos/ui';

interface StoryVoidLinesProps {
  className?: string;
  dense?: boolean;
}

export function StoryVoidLines({ className, dense = false }: StoryVoidLinesProps) {
  return (
    <svg
      className={cn('story-void-lines pointer-events-none', className)}
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="40" y1="80" x2="220" y2="180" className="story-void-line" />
      <line x1="780" y1="60" x2="960" y2="160" className="story-void-line" />
      <line x1="120" y1="420" x2="280" y2="520" className="story-void-line" />
      <line x1="720" y1="400" x2="900" y2="500" className="story-void-line" />
      {dense ? (
        <>
          <line x1="480" y1="40" x2="520" y2="140" className="story-void-line story-void-line-faint" />
          <line x1="860" y1="260" x2="980" y2="300" className="story-void-line story-void-line-faint" />
          <line x1="20" y1="260" x2="140" y2="300" className="story-void-line story-void-line-faint" />
        </>
      ) : null}
      <circle cx="500" cy="300" r="120" className="story-void-ring" fill="none" />
    </svg>
  );
}
