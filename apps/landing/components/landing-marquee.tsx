'use client';

import { useEffect, useRef } from 'react';
import { loadGsap, prefersReducedMotion } from '@/lib/motion';

const ROW_A = [
  'Resume',
  'Pipeline',
  'Interview',
  'Offer',
  'Career Library',
  'ATS Score',
  'Job CRM',
  'Cover Letter',
];

const ROW_B = [
  'One workspace',
  'Tailor faster',
  'Prep smarter',
  'Track everything',
  'Land the role',
  'Stay calm',
  'JobOS',
  'Get clarity',
];

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    let tween: { kill: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      const distance = track.scrollWidth / 2;
      gsap.set(track, { x: reverse ? -distance : 0 });
      tween = gsap.to(track, {
        x: reverse ? 0 : -distance,
        duration: 28,
        ease: 'none',
        repeat: -1,
      });
    });

    return () => tween?.kill();
  }, [reverse]);

  const doubled = [...items, ...items];

  return (
    <div className="landing-marquee-row overflow-hidden">
      <div ref={trackRef} className="landing-marquee-track flex w-max gap-3 px-2">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="landing-marquee-pill">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LandingMarquee({ className = '' }: { className?: string }) {
  return (
    <div className={`landing-marquee pointer-events-none select-none ${className}`} aria-hidden>
      <MarqueeRow items={ROW_A} />
      <MarqueeRow items={ROW_B} reverse />
    </div>
  );
}
