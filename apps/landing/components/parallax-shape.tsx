'use client';

import { cn } from '@jobos/ui';

type ParallaxShapeVariant = 'ring' | 'dot' | 'line-h' | 'line-v' | 'grid-block';

interface ParallaxShapeProps {
  variant?: ParallaxShapeVariant;
  className?: string;
  parallaxY?: number;
  parallaxX?: number;
  section?: boolean;
}

export function ParallaxShape({
  variant = 'ring',
  className,
  parallaxY = 0,
  parallaxX = 0,
  section = false,
}: ParallaxShapeProps) {
  const attrs = section
    ? {
        'data-parallax-section': true,
        'data-parallax-y': String(parallaxY),
        'data-parallax-x': String(parallaxX),
      }
    : {
        'data-parallax': true,
        'data-parallax-y': String(parallaxY),
        'data-parallax-x': String(parallaxX),
      };

  return (
    <div
      {...attrs}
      aria-hidden
      className={cn('landing-parallax-shape', `landing-parallax-${variant}`, className)}
    />
  );
}
