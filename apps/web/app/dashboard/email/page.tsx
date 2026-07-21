'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Skeleton,
  Textarea,
} from '@jobos/ui';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
}

interface JobOption {
  id: string;
  title: string;
  company: string;
}

export default function EmailPage() {
  const api = useApiClient();
  const [jobId, setJobId] = useState('');
  const [templateId, setTemplateId] = useState('follow-up');
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => api.get<EmailTemplate[]>('/email/templates'),
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-list-email'],
    queryFn: () => api.get<JobOption[]>('/jobs'),
  });

  const generate = useMutation({
    mutationFn: () => api.post<{ subject: string; body: string }>('/email/generate', { jobId, templateId }),
    onSuccess: setResult,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email</h1>
        <p className="text-muted-foreground">Generate follow-ups and thank-you notes for your applications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compose with AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Job</Label>
            {jobsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                id="job"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a job...</option>
                {jobs?.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            {templatesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {templates?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Button
            disabled={!jobId || generate.isPending}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? 'Generating...' : 'Generate Email'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base">{result.subject}</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(`${result.subject}\n\n${result.body}`)}
            >
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea value={result.body} readOnly rows={12} className="text-sm" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
