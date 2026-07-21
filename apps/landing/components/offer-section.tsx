'use client';

import { SignUpButton } from '@clerk/nextjs';
import { LandingCtaButton } from '@/components/landing-cta-button';
import { LandingMarquee } from '@/components/landing-marquee';

export function OfferSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
      <div
        data-cinematic-reveal
        className="story-vertical-card relative mx-auto max-w-xl overflow-hidden p-10 text-center"
      >
        <h2
          data-cinematic-line
          className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Offer accepted.
        </h2>
        <p data-cinematic-fade className="mt-4 text-lg text-muted-foreground sm:text-xl">
          No confetti. No noise. Just the outcome you were working toward — because the search
          finally had a system behind it.
        </p>
        <SignUpButton mode="modal">
          <LandingCtaButton className="mt-10">Start your search the right way</LandingCtaButton>
        </SignUpButton>
        <LandingMarquee className="mt-10 opacity-70" />
      </div>
    </section>
  );
}
