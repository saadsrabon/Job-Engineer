'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useApiClient } from '@/lib/api';
import type { InterviewCompanySummary, InterviewQuestionItem, InterviewProgressStats } from '@jobos/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Skeleton,
} from '@jobos/ui';
import { Search, Building2, ExternalLink } from 'lucide-react';

export default function InterviewsPage() {
  const api = useApiClient();
  const [search, setSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: companies, isLoading } = useQuery({
    queryKey: ['interview-companies'],
    queryFn: () => api.get<InterviewCompanySummary[]>('/interviews/companies'),
  });

  const { data: companyDetail } = useQuery({
    queryKey: ['interview-company', selectedSlug],
    queryFn: () =>
      api.get<InterviewCompanySummary & { questions: InterviewQuestionItem[] }>(
        `/interviews/companies/${selectedSlug}`,
      ),
    enabled: Boolean(selectedSlug),
  });

  const { data: searchResults } = useQuery({
    queryKey: ['interview-search', search],
    queryFn: () => api.get<InterviewQuestionItem[]>(`/interviews/questions/search?q=${encodeURIComponent(search)}`),
    enabled: search.trim().length >= 2,
  });

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: progress } = useQuery({
    queryKey: ['interview-progress'],
    queryFn: () => api.get<InterviewProgressStats>('/interviews/progress'),
  });

  const { data: topics } = useQuery({
    queryKey: ['interview-topics'],
    queryFn: () => api.get<Array<{ topic: string; count: number }>>('/interviews/topics'),
  });

  const { data: syncMeta } = useQuery({
    queryKey: ['interview-sync-meta'],
    queryFn: () => api.get<{ commitSha: string | null; syncedAt: string }>('/interviews/sync-meta'),
  });

  const [coachResult, setCoachResult] = useState<{ questionId: string; answer: string } | null>(null);

  const { data: topicQuestions, isLoading: topicLoading } = useQuery({
    queryKey: ['interview-topic-questions', selectedTopic],
    queryFn: () =>
      api.get<InterviewQuestionItem[]>(
        `/interviews/topics/${encodeURIComponent(selectedTopic!)}/questions`,
      ),
    enabled: Boolean(selectedTopic) && !selectedSlug && search.trim().length < 2,
  });

  const { data: mockSession, refetch: loadMock } = useQuery({
    queryKey: ['interview-mock', selectedSlug],
    queryFn: () =>
      api.get<InterviewQuestionItem[]>(
        `/interviews/mock/session${selectedSlug ? `?company=${encodeURIComponent(selectedSlug)}` : ''}`,
      ),
    enabled: false,
  });

  const [mockIndex, setMockIndex] = useState(0);
  const [confidence, setConfidence] = useState(3);

  const practice = useMutation({
    mutationFn: (questionId: string) =>
      api.post(`/interviews/practice/${questionId}`, { confidence }),
  });

  const coach = useMutation({
    mutationFn: (questionId: string) =>
      api.post<{ answer: string; keyPoints: string[] }>('/ai/coach-answer', { questionId }),
    onSuccess: (data, questionId) => {
      setCoachResult({ questionId, answer: data.answer });
    },
  });

  const questions = search.trim().length >= 2
    ? searchResults
    : selectedTopic && !selectedSlug
      ? topicQuestions
      : companyDetail?.questions?.filter((q) =>
          selectedTopic ? q.topics.includes(selectedTopic) : true,
        );

  const panelTitle =
    search.trim().length >= 2
      ? 'Search Results'
      : selectedTopic && !selectedSlug
        ? `Topic: ${selectedTopic}`
        : companyDetail?.name || (selectedTopic ? `Topic: ${selectedTopic}` : 'Select a company');

  const activeMockQuestion = mockSession?.[mockIndex];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Interview Prep</h1>
        <p className="text-muted-foreground">
          Top company questions from{' '}
          <a
            href="https://github.com/saadsrabon/interview-questions-bangladesh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Interview BD
          </a>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{progress?.practiced ?? 0}</p>
            <p className="text-sm text-muted-foreground">Questions practiced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{progress?.totalQuestions ?? 0}</p>
            <p className="text-sm text-muted-foreground">In question bank</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{progress?.companiesStarted ?? 0}</p>
            <p className="text-sm text-muted-foreground">Companies started</p>
          </CardContent>
        </Card>
      </div>

      {topics?.length ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedTopic ? 'outline' : 'default'}
            onClick={() => setSelectedTopic(null)}
          >
            All topics
          </Button>
          {topics.slice(0, 8).map((t) => (
            <Button
              key={t.topic}
              size="sm"
              variant={selectedTopic === t.topic ? 'default' : 'outline'}
              onClick={() => {
                setSelectedTopic(t.topic);
                setSearch('');
              }}
            >
              {t.topic} ({t.count})
            </Button>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mock interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={async () => {
                setMockIndex(0);
                await loadMock();
              }}
            >
              Start session{selectedSlug ? ` (${selectedSlug})` : ''}
            </Button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Confidence
              <select
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}/5
                  </option>
                ))}
              </select>
            </label>
          </div>
          {activeMockQuestion ? (
            <div className="rounded-xl border border-border p-4 text-sm">
              <p className="font-medium">{activeMockQuestion.question}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => practice.mutate(activeMockQuestion.id)}>
                  Mark practiced
                </Button>
                <Button size="sm" onClick={() => coach.mutate(activeMockQuestion.id)} disabled={coach.isPending}>
                  AI Coach
                </Button>
                {mockIndex < (mockSession?.length ?? 1) - 1 ? (
                  <Button size="sm" variant="outline" onClick={() => setMockIndex((i) => i + 1)}>
                    Next question
                  </Button>
                ) : (
                  <Badge variant="outline">Session complete</Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Practice 5 questions in sequence. Select a company first to focus the session.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              companies?.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(c.slug);
                    setSearch('');
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    selectedSlug === c.slug ? 'bg-muted font-medium' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {c.name}
                  </span>
                  <Badge variant="outline">{c._count?.questions ?? 0}</Badge>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{panelTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !questions?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Select a company, topic, or search to browse questions.
              </p>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="rounded-xl border border-border p-4">
                  <p className="text-sm font-medium">{q.question}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.topics.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                    {q.verified && <Badge className="text-xs">Verified</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    >
                      {expandedId === q.id ? 'Hide Answer' : 'Show Answer'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => practice.mutate(q.id)}>
                      Mark Practiced
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => coach.mutate(q.id)}
                      disabled={coach.isPending}
                    >
                      AI Coach
                    </Button>
                    {q.externalUrl && (
                      <a
                        href={q.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        External
                      </a>
                    )}
                  </div>
                  {expandedId === q.id && q.answer && (
                    <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
                      {q.answer}
                    </pre>
                  )}
                  {coachResult?.questionId === q.id && (
                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                      <p className="font-medium">AI Coach</p>
                      <p className="mt-1 whitespace-pre-wrap">{coachResult.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Question data sourced from Interview BD (GPL-3.0).
        {syncMeta?.commitSha && (
          <> Last sync: {syncMeta.commitSha.slice(0, 7)}.</>
        )}{' '}
        <Link href="https://github.com/saadsrabon/interview-questions-bangladesh" className="text-primary hover:underline">
          View source repo
        </Link>
      </p>
    </div>
  );
}
