'use client';

import SplitType from 'split-type';
import type { loadGsap } from '@/lib/motion';

type GsapInstance = Awaited<ReturnType<typeof loadGsap>>['gsap'];
type Timeline = ReturnType<GsapInstance['timeline']>;

const COPY_START = 0.1;
const COPY_END = 0.38;
const HOLD_END = 0.76;
const REVEAL_START = 0.4;
const EXIT_START = 0.9;

const splitsRegistry = new WeakMap<HTMLElement, SplitType[]>();

export function setupHeroIntroAnimation(gsap: GsapInstance, panel: HTMLElement) {
  const splits: SplitType[] = [];
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

  gsap.set(panel.querySelector('.story-card-inner'), { clearProps: 'all' });

  panel.querySelectorAll<HTMLElement>('[data-cinematic-fade]').forEach((el, index) => {
    intro.from(el, { opacity: 0, y: 14, duration: 0.55 }, index * 0.04);
  });

  panel.querySelectorAll<HTMLElement>('[data-cinematic-line]').forEach((line, index) => {
    const split = new SplitType(line, { types: 'words' });
    splits.push(split);
    const words = split.words ?? [];
    gsap.set(words, { display: 'inline-block' });
    intro.from(
      words,
      { opacity: 0, y: 22, duration: 0.55, stagger: 0.022 },
      0.12 + index * 0.14,
    );
  });

  panel.querySelectorAll<HTMLElement>('[data-cinematic-reveal]').forEach((el) => {
    intro.from(el, { opacity: 0, y: 28, duration: 0.65 }, 0.72);
  });

  splitsRegistry.set(panel, splits);

  return () => {
    splits.forEach((split) => split.revert());
    splitsRegistry.delete(panel);
  };
}

export function setupHeroScrollTimeline(
  gsap: GsapInstance,
  tl: Timeline,
  inner: HTMLElement,
  isLast: boolean,
) {
  gsap.set(inner, { opacity: 1, scale: 1, y: 0, clearProps: 'filter' });

  if (!isLast) {
    tl.to(
      inner,
      {
        y: -48,
        scale: 0.94,
        opacity: 0,
        ease: 'power2.inOut',
        duration: 0.14,
      },
      EXIT_START,
    );
  }
}

export function setupPanelEnterExit(
  gsap: GsapInstance,
  tl: Timeline,
  inner: HTMLElement,
  panel: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'none',
  width: number,
  isLast: boolean,
) {
  if (panel.id === 'story-intro') return;

  const slide = Math.min(width * 0.14, 96);
  const enterX = direction === 'left' ? -slide : direction === 'right' ? slide : 0;
  const enterY = direction === 'up' ? 72 : 48;

  gsap.set(inner, { transformOrigin: 'center center' });

  if (direction !== 'none') {
    tl.fromTo(
      inner,
      { x: enterX, y: enterY, scale: 0.9, opacity: 0 },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: 'power3.out',
        duration: 0.2,
      },
      0,
    );
  }

  if (!isLast) {
    const exitX = direction === 'left' ? -32 : direction === 'right' ? 32 : 0;
    tl.to(
      inner,
      {
        x: exitX,
        y: -56,
        scale: 0.92,
        opacity: 0,
        ease: 'power2.inOut',
        duration: 0.14,
      },
      EXIT_START,
    );
  }
}

export function setupCinematicCopy(gsap: GsapInstance, tl: Timeline, panel: HTMLElement) {
  if (panel.id === 'story-intro') return () => undefined;

  const lines = gsap.utils.toArray<HTMLElement>('[data-cinematic-line]', panel);
  const splits: SplitType[] = [];

  lines.forEach((line, index) => {
    const split = new SplitType(line, { types: 'lines,words' });
    splits.push(split);

    const words = split.words ?? [];
    gsap.set(words, { display: 'inline-block' });

    const slot = COPY_START + index * 0.07;
    const stagger = Math.min(0.012, 0.1 / Math.max(words.length, 1));

    tl.fromTo(
      words,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.08,
        stagger,
        ease: 'power3.out',
        immediateRender: false,
      },
      slot,
    );

    tl.set(words, { opacity: 1, y: 0 }, COPY_END);
  });

  tl.to({}, { duration: HOLD_END - COPY_END }, COPY_END);

  const plainLines = gsap.utils.toArray<HTMLElement>('[data-cinematic-fade]', panel);
  plainLines.forEach((line, index) => {
    tl.fromTo(
      line,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.1, ease: 'power3.out', immediateRender: false },
      COPY_START + 0.05 + index * 0.04,
    );
    tl.set(line, { opacity: 1, y: 0 }, COPY_END);
  });

  const reveals = gsap.utils.toArray<HTMLElement>('[data-cinematic-reveal]', panel);
  reveals.forEach((el, index) => {
    tl.fromTo(
      el,
      { opacity: 0, y: 56, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.14,
        ease: 'power3.out',
        immediateRender: false,
      },
      REVEAL_START + index * 0.045,
    );
  });

  const previews = gsap.utils.toArray<HTMLElement>('[data-cinematic-preview]', panel);
  previews.forEach((el, index) => {
    tl.fromTo(
      el,
      { opacity: 0, y: 72, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.16,
        ease: 'power3.out',
        immediateRender: false,
      },
      REVEAL_START + 0.05 + index * 0.05,
    );
  });

  return () => {
    splits.forEach((split) => split.revert());
  };
}

export function setupStatementStack(gsap: GsapInstance, tl: Timeline, panel: HTMLElement) {
  const stack = panel.querySelector('[data-cinematic-stack]');
  if (!stack) return;

  const lines = gsap.utils.toArray<HTMLElement>('[data-stack-line]', stack);
  const firstLine = lines[0];
  if (!firstLine || lines.length === 0) return;

  tl.set(lines, { opacity: 0, y: 48, scale: 0.94 }, COPY_START);
  tl.set(firstLine, { opacity: 1, y: 0, scale: 1 }, COPY_START);

  const segment = (COPY_END - COPY_START) / lines.length;

  lines.forEach((line, index) => {
    if (index === 0) return;
    const start = COPY_START + index * segment;
    const previous = lines[index - 1];
    if (!previous) return;

    tl.to(
      previous,
      { opacity: 0, y: -36, scale: 1.03, duration: 0.1, ease: 'power2.inOut' },
      start,
    );
    tl.to(
      line,
      { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: 'power3.out' },
      start + 0.05,
    );
  });
}
