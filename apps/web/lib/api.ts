'use client';

import { useAuth } from '@clerk/nextjs';
import { ApiClient } from '@jobos/shared';
import { useMemo } from 'react';

export function useApiClient() {
  const { getToken } = useAuth();

  return useMemo(
    () =>
      new ApiClient({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        getToken: () => getToken(),
      }),
    [getToken],
  );
}
