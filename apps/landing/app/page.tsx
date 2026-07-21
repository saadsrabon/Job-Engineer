'use client';

import { useEffect, useRef } from 'react';
import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@jobos/ui';
import { AuthControls } from '@/components/auth-controls';
import { ChaosSection } from '@/components/chaos-section';
import { UnifiedSection } from '@/components/unified-section';
import { PlaceholderSections } from '@/components/placeholder-sections';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    import('gsap').then(({ gsap }) => {
      if (heroRef.current) {
        gsap.from(heroRef.current.children, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-semibold">JobOS</span>
          <AuthControls />
        </div>
      </header>

      <section ref={heroRef} className="flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Job searching shouldn&apos;t feel like a second full-time job.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          JobOS is the operating system for your career — resume, applications, interviews, and offers in one place.
        </p>
        <SignUpButton mode="modal">
          <Button size="lg" className="mt-8">
            Get Started
          </Button>
        </SignUpButton>
      </section>

      <ChaosSection />
      <UnifiedSection />
      <PlaceholderSections />

      <footer className="border-t border-border py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JobOS. The Operating System for Your Career.
      </footer>
    </div>
  );
}
