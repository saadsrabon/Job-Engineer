'use client';

import { SignedIn, useUser } from '@clerk/nextjs';
import { AuthControls } from '@/components/auth-controls';

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        <SignedIn>
          <span className="text-sm text-muted-foreground">
            {user?.fullName || user?.primaryEmailAddress?.emailAddress}
          </span>
        </SignedIn>
        <AuthControls />
      </div>
    </header>
  );
}
