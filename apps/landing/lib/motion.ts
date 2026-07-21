'use client';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

export async function loadGsapFlip() {
  const [{ gsap }, { ScrollTrigger }, { Flip }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/Flip'),
  ]);
  gsap.registerPlugin(ScrollTrigger, Flip);
  return { gsap, ScrollTrigger, Flip };
}

type GsapInstance = Awaited<ReturnType<typeof loadGsap>>['gsap'];

export function revealOnScroll(
  gsap: GsapInstance,
  targets: gsap.TweenTarget,
  trigger: Element,
  options?: {
    start?: string;
    y?: number;
    stagger?: number;
    duration?: number;
    delay?: number;
  },
) {
  gsap.from(targets, {
    y: options?.y ?? 24,
    opacity: 0,
    duration: options?.duration ?? 0.7,
    delay: options?.delay ?? 0,
    stagger: options?.stagger ?? 0.08,
    ease: 'power2.out',
    clearProps: 'transform',
    scrollTrigger: {
      trigger,
      start: options?.start ?? 'top 82%',
      toggleActions: 'play none none reverse',
    },
  });
}
