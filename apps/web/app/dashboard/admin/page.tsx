'use client';

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { AdminOverview } from '@jobos/types';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge } from '@jobos/ui';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  const api = useApiClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => api.get<AdminOverview>('/admin/overview'),
    retry: false,
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Admin access required. Set your email in `ADMIN_EMAILS` in the root `.env` file.
        </p>
      </div>
    );
  }

  const stats = [
    { label: 'Users', value: data?.users ?? 0 },
    { label: 'Jobs', value: data?.jobs ?? 0 },
    { label: 'Interview companies', value: data?.interviewCompanies ?? 0 },
    { label: 'Interview questions', value: data?.interviewQuestions ?? 0 },
    { label: 'AI generations', value: data?.aiGenerations ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Shield className="h-6 w-6" />
          Admin
        </h1>
        <p className="text-muted-foreground">Platform overview and AI model configuration.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview data sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.syncMeta?.commitSha ? (
            <p>
              Last synced commit:{' '}
              <Badge variant="outline">{data.syncMeta.commitSha.slice(0, 7)}</Badge>
            </p>
          ) : (
            <p className="text-muted-foreground">No sync metadata yet. Run `pnpm interview:sync` then `pnpm db:seed`.</p>
          )}
          {data?.syncMeta?.syncedAt && (
            <p className="text-muted-foreground">
              Synced at {new Date(data.syncMeta.syncedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data?.aiModels?.map((model) => (
            <div key={model.agent} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{model.agent}</span>
              <span className="text-muted-foreground">{model.modelId}</span>
              <Badge variant={model.enabled ? 'default' : 'outline'}>
                {model.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
