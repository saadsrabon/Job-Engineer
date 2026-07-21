'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { UserProfile } from '@jobos/types';
import { Button, Skeleton } from '@jobos/ui';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const api = useApiClient();
  const router = useRouter();

  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get<UserProfile>('/users/me'),
    retry: 1,
  });

  useEffect(() => {
    if (!isLoading && user && !user.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div>
          <p className="text-sm font-medium">Could not load your account</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'The JobOS API is unreachable.'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Quick checks</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Start the API: <code className="text-foreground">pnpm dev:api</code></li>
            <li>Start Docker: <code className="text-foreground">pnpm docker:up</code></li>
            <li>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</li>
          </ul>
        </div>
        <Button size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (user && !user.onboardingComplete) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}
