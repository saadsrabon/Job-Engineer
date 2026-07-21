'use client';

import Lenis from 'lenis';
import { loadGsap, prefersReducedMotion } from '@/lib/motion';

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

export async function initSmoothScroll() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return null;
  if (lenisInstance) return lenisInstance;

  const { gsap, ScrollTrigger } = await loadGsap();

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.35,
  });

  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.refresh();

  return lenisInstance;
}

export function destroySmoothScroll() {
  lenisInstance?.destroy();
  lenisInstance = null;
}

export async function bootLandingMotion() {
  if (prefersReducedMotion()) {
    return () => undefined;
  }

  await initSmoothScroll();

  return () => {
    destroySmoothScroll();
  };
}
