'use client';

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { DashboardStats } from '@jobos/types';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@jobos/ui';
import { Briefcase, Send, Users, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const api = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardStats>('/jobs/dashboard'),
  });

  const stats = [
    { label: 'Total Jobs', value: data?.totalJobs ?? 0, icon: Briefcase },
    { label: 'Active Applications', value: data?.activeApplications ?? 0, icon: Send },
    { label: 'Interviews', value: data?.interviews ?? 0, icon: Users },
    { label: 'Offers', value: data?.offers ?? 0, icon: Trophy },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job search pipeline.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : data?.recentActivity?.length ? (
            <ul className="space-y-3">
              {data.recentActivity.map((item: { id: string; message: string; createdAt: string }) => (
                <li key={item.id} className="flex items-start justify-between text-sm">
                  <span>{item.message}</span>
                  <span className="text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet. Add a job to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
