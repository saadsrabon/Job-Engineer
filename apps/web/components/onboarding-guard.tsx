'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { UserProfile } from '@jobos/types';
import { Skeleton } from '@jobos/ui';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const api = useApiClient();
  const router = useRouter();

  const { data: user, isLoading, isError } = useQuery({
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

  if (isError || (user && !user.onboardingComplete)) {
    return null;
  }

  return <>{children}</>;
}
