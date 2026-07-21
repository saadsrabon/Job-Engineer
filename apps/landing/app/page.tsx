'use client';

import { SignUpButton } from '@clerk/nextjs';
import { AuthControls } from '@/components/auth-controls';
import { LandingBackground } from '@/components/landing-background';
import { ParallaxScroll } from '@/components/parallax-scroll';
import { LandingCtaButton } from '@/components/landing-cta-button';
import { LandingMarquee } from '@/components/landing-marquee';
import { ConvergenceSection } from '@/components/convergence-section';
import { CompareSection } from '@/components/compare-section';
import { ResumePipelineSection } from '@/components/resume-pipeline-section';
import { CrmKanbanSection } from '@/components/crm-kanban-section';
import { InterviewSection } from '@/components/interview-section';
import { AnalyticsSection } from '@/components/analytics-section';
import { AiIntelligenceSection } from '@/components/ai-intelligence-section';
import { EmailSection } from '@/components/email-section';
import { ExtensionSection } from '@/components/extension-section';
import { OfferSection } from '@/components/offer-section';
import { FaqSection } from '@/components/faq-section';
import { StoryScroll, StoryPanel } from '@/components/story-scroll';
import { StoryProgressRail } from '@/components/story-progress-rail';
import { LandingFooter } from '@/components/landing-footer';
import { LandingMotionRoot } from '@/components/landing-motion-root';

export default function LandingPage() {
  return (
    <LandingMotionRoot>
    <div className="landing-page relative min-h-screen">
      <LandingBackground />
      <ParallaxScroll />
      <StoryProgressRail />

      <header className="fixed top-0 z-50 w-full border-b border-emerald-500/10 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight landing-accent-text">JobOS</span>
          <AuthControls />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6">
        <StoryScroll>
          <StoryPanel index={0} id="story-intro" variant="glow" enterFrom="up" pinScroll="+=190%">
            <section className="story-hero-content relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
              <p
                data-cinematic-line
                className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
              >
                Hi. We&apos;re JobOS.
              </p>
              <h1
                data-cinematic-line
                className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              >
                Job searching shouldn&apos;t feel like a second full-time job.
              </h1>
              <p
                data-cinematic-line
                className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                One calm workspace where your resume, applications, interviews, and offers finally
                connect — built for clarity, not chaos.
              </p>
              <div data-cinematic-reveal>
                <SignUpButton mode="modal">
                  <LandingCtaButton className="mt-8">Get Started — it&apos;s free</LandingCtaButton>
                </SignUpButton>
                <p className="mt-3 text-xs text-muted-foreground">
                  No credit card. Set up in under 5 minutes.
                </p>
              </div>
              <LandingMarquee className="absolute bottom-4 left-0 right-0 sm:bottom-6" />
            </section>
          </StoryPanel>

          <StoryPanel
            index={1}
            id="story-problem"
            pinned
            pinScroll="+=420%"
            fullBleed
            variant="muted"
            enterFrom="none"
          >
            <ConvergenceSection />
          </StoryPanel>

          <StoryPanel index={2} id="story-relate" variant="contrast" enterFrom="right" pinScroll="+=260%">
            <CompareSection embedded />
          </StoryPanel>

          <StoryPanel index={3} id="story-profile" variant="contrast" enterFrom="left" pinScroll="+=220%">
            <ResumePipelineSection embedded />
          </StoryPanel>

          <StoryPanel index={4} id="story-ai" variant="glow" enterFrom="right" pinScroll="+=220%">
            <AiIntelligenceSection embedded />
          </StoryPanel>

          <StoryPanel index={5} id="story-pipeline" fullBleed variant="glow" enterFrom="right" pinScroll="+=210%">
            <CrmKanbanSection embedded />
          </StoryPanel>

          <StoryPanel index={6} id="story-prep" variant="muted" enterFrom="left" pinScroll="+=220%">
            <InterviewSection embedded />
          </StoryPanel>

          <StoryPanel index={7} id="story-email" variant="contrast" enterFrom="right" pinScroll="+=220%">
            <EmailSection embedded />
          </StoryPanel>

          <StoryPanel index={8} id="story-progress" variant="contrast" enterFrom="right" pinScroll="+=220%">
            <AnalyticsSection embedded />
          </StoryPanel>

          <StoryPanel index={9} id="story-extension" variant="muted" enterFrom="left" pinScroll="+=220%">
            <ExtensionSection embedded />
          </StoryPanel>

          <StoryPanel index={10} id="story-outcome" variant="glow" enterFrom="left" pinScroll="+=200%">
            <OfferSection embedded />
          </StoryPanel>

          <StoryPanel index={11} id="story-faq" variant="muted" enterFrom="right" pinScroll="+=170%" cardClassName="pb-4">
            <FaqSection embedded />
          </StoryPanel>
        </StoryScroll>
      </div>

      <LandingFooter />
    </div>
    </LandingMotionRoot>
  );
}
