'use client';

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { AnalyticsOverview } from '@jobos/types';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge } from '@jobos/ui';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const api = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get<AnalyticsOverview>('/analytics/overview'),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const stats = [
    { label: 'Total jobs', value: data?.totalJobs ?? 0 },
    { label: 'Applied', value: data?.applied ?? 0 },
    { label: 'Interviews', value: data?.interviews ?? 0 },
    { label: 'Offers', value: data?.offers ?? 0 },
  ];

  const rates = [
    { label: 'Response rate', value: data?.responseRate ?? 0, suffix: '%' },
    { label: 'Interview rate', value: data?.interviewRate ?? 0, suffix: '%' },
    { label: 'Offer rate', value: data?.offerRate ?? 0, suffix: '%' },
  ];

  const maxFunnel = Math.max(...(data?.funnel?.map((f) => f.count) ?? [1]), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BarChart3 className="h-6 w-6" />
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Pipeline funnel, conversion rates, and weekly activity from your CRM data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {rates.map((r) => (
          <Card key={r.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {r.value}
                  {r.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{r.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.funnel?.map((row) => (
              <div key={row.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{row.stage}</span>
                  <Badge variant="outline">{row.count}</Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max((row.count / maxFunnel) * 100, row.count ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.weeklyActivity?.length ? (
              data.weeklyActivity.map((week) => (
                <div key={week.week} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Week of {week.week}</span>
                  <span>
                    {week.applications} apps · {week.interviews} interviews
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Add jobs to see activity trends.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
