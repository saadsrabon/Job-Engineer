'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@jobos/ui';
import { loadGsap, prefersReducedMotion } from '@/lib/motion';
import { initSmoothScroll } from '@/lib/smooth-scroll';
import {
  setupCinematicCopy,
  setupHeroIntroAnimation,
  setupHeroScrollTimeline,
  setupPanelEnterExit,
  setupStatementStack,
} from '@/lib/cinematic-timeline';
import { setupConvergenceTimeline } from '@/lib/convergence-timeline';
import { setupAnalyticsCounters, setupCrmKanbanTimeline } from '@/lib/section-timelines';

type SectionVariant = 'default' | 'glow' | 'muted' | 'contrast';
type EnterFrom = 'left' | 'right' | 'up' | 'none';

const HEADER_OFFSET = 56;

const variantClass: Record<SectionVariant, string> = {
  default: '',
  glow: 'landing-section-glow',
  muted: 'landing-section-muted',
  contrast: 'landing-section-contrast',
};

interface StoryPanelProps {
  index: number;
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
  variant?: SectionVariant;
  pinned?: boolean;
  pinScroll?: string;
  id?: string;
  fullBleed?: boolean;
  enterFrom?: EnterFrom;
}

export function StoryPanel({
  index,
  children,
  className,
  cardClassName,
  variant = 'default',
  pinned = false,
  pinScroll,
  id,
  fullBleed = false,
  enterFrom,
}: StoryPanelProps) {
  const resolvedEnter = enterFrom ?? (index % 2 === 0 ? 'left' : 'right');
  const resolvedPinScroll = pinScroll ?? (pinned ? '+=380%' : '+=160%');

  return (
    <div
      id={id}
      data-story-panel
      data-story-index={index}
      data-story-pinned={pinned ? 'true' : 'false'}
      data-pin-scroll={resolvedPinScroll}
      data-enter-from={resolvedEnter}
      className={cn('story-panel', className)}
      style={{ zIndex: 10 + index }}
    >
      <div
        className={cn(
          'story-card-inner',
          variantClass[variant],
          fullBleed && 'story-card-inner-bleed',
          pinned && 'story-card-inner-pinned',
          cardClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface StoryScrollProps {
  children: React.ReactNode;
}

export function StoryScroll({ children }: StoryScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    let ctx: { revert: () => void } | undefined;
    const cleanups: Array<() => void> = [];

    (async () => {
      await initSmoothScroll();
      const { gsap, ScrollTrigger } = await loadGsap();

      ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>('[data-story-panel]', root);
        const heroPanel = panels.find((panel) => panel.id === 'story-intro');

        if (heroPanel) {
          cleanups.push(setupHeroIntroAnimation(gsap, heroPanel));
        }

        panels.forEach((panel, index) => {
          const inner = panel.querySelector('.story-card-inner') as HTMLElement | null;
          if (!inner) return;

          const direction = (panel.dataset.enterFrom || 'left') as EnterFrom;
          const pinScroll = panel.dataset.pinScroll || '+=160%';
          const isLast = index === panels.length - 1;
          const isHero = panel.id === 'story-intro';

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: `top top+=${HEADER_OFFSET}`,
              end: pinScroll,
              pin: true,
              pinSpacing: true,
              scrub: 1.05,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          if (isHero) {
            setupHeroScrollTimeline(gsap, tl, inner, isLast);
          } else {
            setupPanelEnterExit(gsap, tl, inner, panel, direction, window.innerWidth, isLast);
            cleanups.push(setupCinematicCopy(gsap, tl, panel) ?? (() => {}));
            setupStatementStack(gsap, tl, panel);
          }

          if (panel.id === 'story-problem') {
            const stage = panel.querySelector('[data-convergence-stage]') as HTMLElement | null;
            const tabs = panel.querySelector('[data-convergence-tabs]') as HTMLElement | null;
            const dashboard = panel.querySelector('[data-convergence-dashboard]') as HTMLElement | null;

            if (stage && tabs && dashboard) {
              cleanups.push(
                setupConvergenceTimeline(gsap, tl, { stage, tabs, dashboard }, 0.4, 0.34) ??
                  (() => {}),
              );
            }
          }

          if (panel.id === 'story-pipeline') {
            setupCrmKanbanTimeline(gsap, tl, panel);
          }

          if (panel.id === 'story-progress') {
            setupAnalyticsCounters(gsap, tl, panel);
          }
        });

        ScrollTrigger.refresh();
      }, root);
    })();

    return () => {
      cleanups.forEach((fn) => fn());
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="story-scroll-root">
      {children}
    </div>
  );
}
