'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { JobReminderItem } from '@jobos/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Badge,
} from '@jobos/ui';
import { Bell, Check } from 'lucide-react';

interface JobOption {
  id: string;
  title: string;
  company: string;
}

export default function RemindersPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState('');
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.get<JobReminderItem[]>('/automation/reminders'),
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs-list'],
    queryFn: () => api.get<JobOption[]>('/jobs'),
  });

  const createReminder = useMutation({
    mutationFn: () =>
      api.post('/automation/reminders', {
        jobId,
        title,
        dueAt: new Date(dueAt).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setTitle('');
      setDueAt('');
    },
  });

  const completeReminder = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.patch(`/automation/reminders/${id}/complete`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });

  const deleteReminder = useMutation({
    mutationFn: (id: string) => api.delete(`/automation/reminders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Bell className="h-6 w-6" />
          Reminders
        </h1>
        <p className="text-muted-foreground">
          Follow-up nudges tied to jobs in your pipeline — never miss a deadline.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New reminder</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Job</Label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">Select job...</option>
              {jobs?.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.company} — {job.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up with recruiter"
            />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              disabled={!jobId || !title.trim() || !dueAt || createReminder.isPending}
              onClick={() => createReminder.mutate()}
            >
              Add reminder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !reminders?.length ? (
            <p className="text-sm text-muted-foreground">No reminders yet.</p>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div>
                  <p className={`font-medium ${r.completed ? 'line-through opacity-60' : ''}`}>
                    {r.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.job?.company} — {r.job?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(r.dueAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.job?.stage && <Badge variant="outline">{r.job.stage}</Badge>}
                  {!r.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeReminder.mutate({ id: r.id, completed: true })}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Done
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteReminder.mutate(r.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
