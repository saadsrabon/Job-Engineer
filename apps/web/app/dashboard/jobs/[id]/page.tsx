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
  Input,
  Label,
  Skeleton,
} from '@jobos/ui';
import { ArrowLeft, X } from 'lucide-react';

interface JobTag {
  tag: { id: string; name: string; color: string };
}

interface JobDetail {
  id: string;
  title: string;
  company: string;
  stage: string;
  location: string | null;
  url: string | null;
  description: string | null;
  notes: Array<{ id: string; content: string; createdAt: string }>;
  tags: JobTag[];
  stageHistory: Array<{ id: string; fromStage: string | null; toStage: string; createdAt: string }>;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<JobDetail>(`/jobs/${id}`),
  });

  const { data: allTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<Tag[]>('/crm/tags'),
  });

  const addNote = useMutation({
    mutationFn: (content: string) => api.post(`/crm/jobs/${id}/notes`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      setNote('');
    },
  });

  const createTag = useMutation({
    mutationFn: (name: string) => api.post<Tag>('/crm/tags', { name }),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      addTagToJob.mutate(tag.id);
      setNewTagName('');
    },
  });

  const addTagToJob = useMutation({
    mutationFn: (tagId: string) => api.post(`/crm/jobs/${id}/tags/${tagId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', id] }),
  });

  const removeTagFromJob = useMutation({
    mutationFn: (tagId: string) => api.delete(`/crm/jobs/${id}/tags/${tagId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', id] }),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!job) return <p>Job not found</p>;

  const jobTagIds = new Set(job.tags?.map((t) => t.tag.id) ?? []);
  const availableTags = allTags?.filter((t) => !jobTagIds.has(t.id)) ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">
            {job.company}
            {job.location && ` · ${job.location}`}
          </p>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              View posting
            </a>
          )}
        </div>
        <Badge>{job.stage}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {job.tags?.length ? (
              job.tags.map(({ tag }) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="gap-1 pr-1"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTagFromJob.mutate(tag.id)}
                    className="ml-1 rounded hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags yet.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag.id}
                variant="outline"
                size="sm"
                onClick={() => addTagToJob.mutate(tag.id)}
              >
                + {tag.name}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="max-w-xs"
            />
            <Button
              size="sm"
              disabled={!newTagName.trim() || createTag.isPending}
              onClick={() => createTag.mutate(newTagName.trim())}
            >
              Create Tag
            </Button>
          </div>
        </CardContent>
      </Card>

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
