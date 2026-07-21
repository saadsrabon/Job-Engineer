'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@jobos/ui';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ParseJob {
  id: string;
  fileName: string;
  status: string;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function ResumesPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['parse-jobs'],
    queryFn: () => api.get<ParseJob[]>('/resume/parse-jobs'),
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(
        (j) => j.status === 'Pending' || j.status === 'Processing',
      );
      return hasPending ? 3000 : false;
    },
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      await api.upload<{ id: string }>('/resume/upload', file);
      queryClient.invalidateQueries({ queryKey: ['parse-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['career'] });
    } finally {
      setUploading(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Processing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
        <p className="text-muted-foreground">
          Upload your resume to populate your Career Library automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            PDF only in Phase 1. Parsed data imports into Career Library.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parse History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : jobs?.length ? (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{job.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(job.status)}
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
