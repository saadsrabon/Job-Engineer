'use client';

type GsapInstance = Awaited<ReturnType<typeof import('./motion').loadGsap>>['gsap'];
type ScrollTriggerInstance = Awaited<
  ReturnType<typeof import('./motion').loadGsap>
>['ScrollTrigger'];

function parseAxis(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function initPageParallax(
  gsap: GsapInstance,
  root: HTMLElement,
  options?: { scrub?: number },
) {
  const scrub = options?.scrub ?? 0.55;

  gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
    const y = parseAxis(el.dataset.parallaxY, 0);
    const x = parseAxis(el.dataset.parallaxX, 0);
    if (y === 0 && x === 0) return;

    gsap.to(el, {
      y,
      x,
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub,
      },
    });
  });
}

export function initSectionParallax(
  gsap: GsapInstance,
  root: HTMLElement,
  options?: { scrub?: number },
) {
  const scrub = options?.scrub ?? 0.45;

  gsap.utils.toArray<HTMLElement>('[data-parallax-section]', root).forEach((el) => {
    const panel = el.closest('[data-story-panel]') as HTMLElement | null;
    if (!panel) return;

    const y = parseAxis(el.dataset.parallaxY, 0);
    const x = parseAxis(el.dataset.parallaxX, 0);
    if (y === 0 && x === 0) return;

    gsap.fromTo(
      el,
      { y: -y * 0.35, x: -x * 0.35 },
      {
        y: y * 0.65,
        x: x * 0.65,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub,
        },
      },
    );
  });
}

export function refreshParallax(_ScrollTrigger: ScrollTriggerInstance) {
  _ScrollTrigger.refresh();
}
