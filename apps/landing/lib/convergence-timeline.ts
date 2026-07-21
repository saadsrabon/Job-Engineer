'use client';

import type { loadGsap } from '@/lib/motion';

type GsapInstance = Awaited<ReturnType<typeof loadGsap>>['gsap'];
type Timeline = ReturnType<GsapInstance['timeline']>;

const TABS = [
  { id: 'excel', label: 'Excel', navTarget: 'dashboard', scatter: { x: -160, y: -70 } },
  { id: 'resume', label: 'Resume.pdf', navTarget: 'resumes', scatter: { x: 120, y: -90 } },
  { id: 'linkedin', label: 'LinkedIn', navTarget: 'career', scatter: { x: -100, y: 40 } },
  { id: 'indeed', label: 'Indeed', navTarget: 'jobs', scatter: { x: 140, y: 60 } },
  { id: 'gmail', label: 'Gmail', navTarget: 'interviews', scatter: { x: -30, y: 100 } },
  { id: 'chatgpt', label: 'ChatGPT', navTarget: null, scatter: { x: 180, y: -20 } },
  { id: 'notion', label: 'Notion', navTarget: null, scatter: { x: -180, y: 20 } },
  { id: 'calendar', label: 'Calendar', navTarget: null, scatter: { x: 60, y: -110 } },
];

interface ConvergenceRefs {
  stage: HTMLElement;
  tabs: HTMLElement;
  dashboard: HTMLElement;
}

export function setupConvergenceTimeline(
  gsap: GsapInstance,
  tl: Timeline,
  refs: ConvergenceRefs,
  startAt = 0.18,
  morphDuration = 0.52,
) {
  const tabEls = gsap.utils.toArray<HTMLElement>('.tab-chip', refs.tabs);

  const getNavPositions = () => {
    const stageRect = refs.stage.getBoundingClientRect();
    const positions: Record<string, { x: number; y: number }> = {};

    tabEls.forEach((el) => {
      const targetId = el.dataset.navTarget;
      if (!targetId) return;
      const navEl = refs.dashboard.querySelector(
        `[data-nav-target="${targetId}"]`,
      ) as HTMLElement | null;
      if (!navEl) return;
      const navRect = navEl.getBoundingClientRect();
      positions[targetId] = {
        x: navRect.left - stageRect.left + navRect.width / 2 - stageRect.width / 2,
        y: navRect.top - stageRect.top + navRect.height / 2 - stageRect.height / 2,
      };
    });

    return positions;
  };

  let navPositions = getNavPositions();

  gsap.set(refs.dashboard, {
    opacity: 0,
    scale: 0.94,
    transformOrigin: 'center center',
  });

  tabEls.forEach((el) => {
    const tab = TABS.find((t) => t.id === el.dataset.tabId);
    if (!tab) return;

    gsap.set(el, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      x: tab.scatter.x,
      y: tab.scatter.y,
      opacity: 0,
      scale: 0.85,
    });
  });

  tl.to(
    tabEls,
    {
      opacity: 1,
      scale: 1,
      duration: 0.1,
      stagger: 0.015,
      ease: 'power3.out',
    },
    startAt,
  );

  const morphState = { progress: 0 };

  tl.to(
    morphState,
    {
      progress: 1,
      duration: morphDuration,
      ease: 'none',
      onUpdate: () => {
        navPositions = getNavPositions();
        const p = morphState.progress;

        tabEls.forEach((el) => {
          const tab = TABS.find((t) => t.id === el.dataset.tabId);
          if (!tab) return;

          if (!tab.navTarget) {
            gsap.set(el, {
              opacity: 1 - p,
              scale: gsap.utils.interpolate(1, 0.8, p),
              x: tab.scatter.x,
              y: tab.scatter.y,
            });
            return;
          }

          const target = navPositions[tab.navTarget];
          const x = target ? gsap.utils.interpolate(tab.scatter.x, target.x, p) : tab.scatter.x;
          const y = target ? gsap.utils.interpolate(tab.scatter.y, target.y, p) : tab.scatter.y;
          const fadeOut = gsap.utils.clamp(0, 1, (p - 0.72) / 0.2);

          gsap.set(el, {
            x,
            y,
            opacity: 1 - fadeOut,
            scale: gsap.utils.interpolate(1, 0.72, p),
          });
        });

        const dashReveal = gsap.utils.clamp(0, 1, (p - 0.55) / 0.45);
        gsap.set(refs.dashboard, {
          opacity: dashReveal,
          scale: gsap.utils.interpolate(0.94, 1, dashReveal),
        });
      },
    },
    startAt + 0.14,
  );

  return () => {
    navPositions = getNavPositions();
  };
}
