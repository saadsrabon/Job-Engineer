'use client';

import type { loadGsap } from '@/lib/motion';

type GsapInstance = Awaited<ReturnType<typeof loadGsap>>['gsap'];
type Timeline = ReturnType<GsapInstance['timeline']>;

export function setupCrmKanbanTimeline(gsap: GsapInstance, tl: Timeline, panel: HTMLElement) {
  const track = panel.querySelector('[data-crm-track]') as HTMLElement | null;
  if (!track) return;

  const distance = Math.max(0, track.scrollWidth - track.clientWidth);
  if (distance <= 0) return;

  tl.fromTo(
    track,
    { x: 0 },
    { x: -distance, ease: 'none', duration: 0.28 },
    0.58,
  );
}

export function setupAnalyticsCounters(gsap: GsapInstance, tl: Timeline, panel: HTMLElement) {
  const items = panel.querySelectorAll('[data-count]');
  if (!items.length) return;

  items.forEach((el, index) => {
    const target = parseInt(el.getAttribute('data-count') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const obj = { val: 0 };

    tl.to(
      obj,
      {
        val: target,
        duration: 0.18,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(obj.val)}${suffix}`;
        },
      },
      0.58 + index * 0.04,
    );
  });
}
