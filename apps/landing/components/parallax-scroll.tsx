'use client';

import { useEffect } from 'react';
import { loadGsap, prefersReducedMotion } from '@/lib/motion';
import { initSmoothScroll } from '@/lib/smooth-scroll';
import { initPageParallax, initSectionParallax, refreshParallax } from '@/lib/parallax';

export function ParallaxScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const root = document.querySelector('.landing-page') as HTMLElement | null;
    if (!root) return;

    let ctx: { revert: () => void } | undefined;

    (async () => {
      await initSmoothScroll();
      const { gsap, ScrollTrigger } = await loadGsap();

      ctx = gsap.context(() => {
        initPageParallax(gsap, root, { scrub: 0.85 });
        initSectionParallax(gsap, root, { scrub: 0.75 });
        refreshParallax(ScrollTrigger);
      }, root);
    })();

    return () => ctx?.revert();
  }, []);

  return null;
}
