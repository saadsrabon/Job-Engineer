'use client';

import { useEffect } from 'react';
import { bootLandingMotion } from '@/lib/smooth-scroll';

export function LandingMotionRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    bootLandingMotion().then((dispose) => {
      cleanup = dispose;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return children;
}
