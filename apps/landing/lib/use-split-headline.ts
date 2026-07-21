'use client';

import { useEffect } from 'react';
import SplitType from 'split-type';
import { loadGsap, prefersReducedMotion } from '@/lib/motion';

export function useSplitHeadline(
  ref: React.RefObject<HTMLElement | null>,
  options?: { stagger?: number; y?: number },
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let split: SplitType | null = null;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      split = new SplitType(el, { types: 'lines,words,chars' });
      ctx = gsap.context(() => {
        gsap.from(split!.chars, {
          opacity: 0,
          y: options?.y ?? 16,
          stagger: options?.stagger ?? 0.018,
          duration: 0.65,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }, el);
    });

    return () => {
      ctx?.revert();
      split?.revert();
    };
  }, [ref, options?.stagger, options?.y]);
}

export function useHeroSplit(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let split: SplitType | null = null;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      split = new SplitType(el, { types: 'lines,words,chars' });
      ctx = gsap.context(() => {
        gsap.from(split!.chars, {
          opacity: 0,
          y: 24,
          stagger: 0.012,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.1,
          clearProps: 'transform',
        });
      }, el);
    });

    return () => {
      ctx?.revert();
      split?.revert();
    };
  }, [ref]);
}
