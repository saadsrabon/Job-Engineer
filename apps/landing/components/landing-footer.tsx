'use client';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer relative z-[100]">
      <div className="landing-footer-inner">
        <p className="landing-footer-wordmark" aria-hidden>
          JOB OS
        </p>
        <p className="landing-footer-copy">
          Copyright © {year} JobOS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
