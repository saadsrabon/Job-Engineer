'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApiClient } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Textarea,
  Skeleton,
} from '@jobos/ui';
import { ArrowLeft } from 'lucide-react';

interface JobDetail {
  id: string;
  title: string;
  company: string;
  stage: string;
  location: string | null;
  url: string | null;
  description: string | null;
  notes: Array<{ id: string; content: string; createdAt: string }>;
  stageHistory: Array<{ id: string; fromStage: string | null; toStage: string; createdAt: string }>;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<JobDetail>(`/jobs/${id}`),
  });

  const addNote = useMutation({
    mutationFn: (content: string) => api.post(`/crm/jobs/${id}/notes`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      setNote('');
    },
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">
            {job.company}
            {job.location && ` · ${job.location}`}
          </p>
        </div>
        <Badge>{job.stage}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
              />
              <Button
                size="sm"
                disabled={!note.trim() || addNote.isPending}
                onClick={() => addNote.mutate(note)}
              >
                Add Note
              </Button>
            </div>
            <ul className="space-y-3">
              {job.notes?.map((n) => (
                <li key={n.id} className="rounded-xl border border-border p-3 text-sm">
                  <p>{n.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {job.stageHistory?.map((h) => (
                <li key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p>
                      {h.fromStage ? `${h.fromStage} → ${h.toStage}` : `Created as ${h.toStage}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
