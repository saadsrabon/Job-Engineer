'use client';

import { webAppPaths } from '@/lib/web-app';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer relative z-[100]">
      <div className="landing-footer-inner">
        <p className="landing-footer-wordmark" aria-hidden>
          JOB OS
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <a
            href={webAppPaths.dashboard}
            className="font-medium text-emerald-400 underline-offset-4 hover:underline"
          >
            Launch app
          </a>
          <a href={webAppPaths.signIn} className="text-muted-foreground hover:text-foreground">
            Sign in
          </a>
          <a href={webAppPaths.signUp} className="text-muted-foreground hover:text-foreground">
            Create account
          </a>
        </nav>
        <p className="landing-footer-copy">
          Copyright © {year} JobOS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
