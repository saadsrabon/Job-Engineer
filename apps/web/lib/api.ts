'use client';

import { useAuth } from '@clerk/nextjs';
import { ApiClient } from '@jobos/shared';
import { useMemo } from 'react';

/** Same-origin proxy in production (`/jobos-api` → VPS via next.config rewrites). */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') return '/jobos-api';
  return 'http://localhost:3001';
}

export function useApiClient() {
  const { getToken } = useAuth();

  return useMemo(
    () =>
      new ApiClient({
        baseUrl: resolveApiBaseUrl(),
        getToken: () => getToken(),
      }),
    [getToken],
  );
}
