'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@jobos/ui';
import { LandingCtaButton } from '@/components/landing-cta-button';
import { webAppPaths } from '@/lib/web-app';

export function AuthControls() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <LandingCtaButton size="sm" className="px-4 sm:px-5" href={webAppPaths.dashboard}>
        Launch app
      </LandingCtaButton>

      <SignedOut>
        <Button variant="ghost" size="sm" asChild>
          <a href={webAppPaths.signIn}>Sign in</a>
        </Button>
      </SignedOut>

      <SignedIn>
        <Button variant="ghost" size="sm" asChild>
          <a href={webAppPaths.dashboard}>Dashboard</a>
        </Button>
        <UserButton afterSignOutUrl="/">
          <UserButton.MenuItems>
            <UserButton.Link label="Open dashboard" href={webAppPaths.dashboard} />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </div>
  );
}
