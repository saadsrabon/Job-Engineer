'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api';
import type { UserProfile } from '@jobos/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@jobos/ui';

export default function OnboardingPage() {
  const api = useApiClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get<UserProfile>('/users/me'),
  });

  useEffect(() => {
    if (user?.onboardingComplete) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const complete = useMutation({
    mutationFn: () => api.patch('/users/me/onboarding'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard/resumes');
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to JobOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your career operating system. Start by uploading your resume — we&apos;ll build your
            Career Library automatically.
          </p>
          <Button onClick={() => complete.mutate()} disabled={complete.isPending} className="w-full">
            {complete.isPending ? 'Setting up...' : 'Get Started'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
