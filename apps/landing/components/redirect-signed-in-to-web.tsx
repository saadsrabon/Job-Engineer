'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { webAppPaths } from '@/lib/web-app';

/**
 * When Clerk has a session on the landing host, send users to the dashboard on the web app.
 */
export function RedirectSignedInToWeb() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.replace(webAppPaths.dashboard);
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
