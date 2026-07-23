'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@jobos/ui';
import type { AtsScoreResult, JobAnalyzerResult, JobSuggestedQuestions, InterviewRoundItem } from '@jobos/types';
import { ArrowLeft, X, Sparkles, MessageSquare, Calendar, Pencil, Trash2 } from 'lucide-react';

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
  const router = useRouter();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    company: '',
    location: '',
    url: '',
    description: '',
  });
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalyzerResult | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [roundTitle, setRoundTitle] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundNotes, setRoundNotes] = useState('');
  const [roundLocation, setRoundLocation] = useState('');
  const [coachResult, setCoachResult] = useState<{ questionId: string; answer: string } | null>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<JobDetail>(`/jobs/${id}`),
  });

  const { data: allTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<Tag[]>('/crm/tags'),
  });

  const { data: suggested } = useQuery({
    queryKey: ['job-suggested-questions', id],
    queryFn: () => api.get<JobSuggestedQuestions>(`/interviews/jobs/${id}/suggested`),
    enabled: Boolean(id),
  });

  const { data: rounds } = useQuery({
    queryKey: ['job-rounds', id],
    queryFn: () => api.get<InterviewRoundItem[]>(`/interviews/jobs/${id}/rounds`),
    enabled: Boolean(id),
  });

  const createRound = useMutation({
    mutationFn: () =>
      api.post(`/interviews/jobs/${id}/rounds`, {
        title: roundTitle,
        scheduledAt: roundDate ? new Date(roundDate).toISOString() : undefined,
        prepNotes: roundNotes || undefined,
        location: roundLocation || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-rounds', id] });
      setRoundTitle('');
      setRoundDate('');
      setRoundNotes('');
      setRoundLocation('');
    },
  });

  const completeRound = useMutation({
    mutationFn: (roundId: string) =>
      api.patch(`/interviews/jobs/${id}/rounds/${roundId}`, { status: 'completed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-rounds', id] }),
  });

  const deleteRound = useMutation({
    mutationFn: (roundId: string) => api.delete(`/interviews/jobs/${id}/rounds/${roundId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-rounds', id] }),
  });

  const saveRoundFeedback = useMutation({
    mutationFn: ({ roundId, feedback }: { roundId: string; feedback: string }) =>
      api.patch(`/interviews/jobs/${id}/rounds/${roundId}`, { feedback }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-rounds', id] }),
  });

  const practiceQuestion = useMutation({
    mutationFn: (questionId: string) => api.post(`/interviews/practice/${questionId}`, {}),
  });

  const coachQuestion = useMutation({
    mutationFn: (questionId: string) =>
      api.post<{ answer: string }>('/ai/coach-answer', { questionId }),
    onSuccess: (data, questionId) => setCoachResult({ questionId, answer: data.answer }),
  });

  const scoreAts = useMutation({
    mutationFn: () => api.post<AtsScoreResult>('/ai/ats-score', { jobId: id }),
    onSuccess: setAtsResult,
  });

  const generateCoverLetter = useMutation({
    mutationFn: () => api.post<{ letter: string }>('/ai/cover-letter', { jobId: id }),
    onSuccess: (data) => {
      setCoverLetter(data.letter);
      setCoverLetterError(null);
    },
    onError: (err) =>
      setCoverLetterError(err instanceof Error ? err.message : 'Cover letter generation failed'),
  });

  const analyzeJob = useMutation({
    mutationFn: () => api.post<JobAnalyzerResult>('/ai/analyze-job', { jobId: id }),
    onSuccess: setJobAnalysis,
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

  const updateJob = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch(`/jobs/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setEditOpen(false);
    },
  });

  const deleteJob = useMutation({
    mutationFn: () => api.delete(`/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      router.push('/dashboard/jobs');
    },
  });

  const openEditDialog = () => {
    if (!job) return;
    setEditForm({
      title: job.title,
      company: job.company,
      location: job.location ?? '',
      url: job.url ?? '',
      description: job.description ?? '',
    });
    setEditOpen(true);
  };

  const handleUpdateJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateJob.mutate({
      title: editForm.title.trim(),
      company: editForm.company.trim(),
      location: editForm.location.trim() || undefined,
      url: editForm.url.trim() || undefined,
      description: editForm.description.trim() || undefined,
    });
  };

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
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{job.stage}</Badge>
          <Button size="sm" variant="outline" className="gap-1" onClick={openEditDialog}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          {job.description ? (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No description yet.{' '}
              <button type="button" className="text-primary hover:underline" onClick={openEditDialog}>
                Add one
              </button>{' '}
              to enable AI job analysis.
            </p>
          )}
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => scoreAts.mutate()} disabled={scoreAts.isPending}>
              {scoreAts.isPending ? 'Scoring...' : 'ATS Score'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => analyzeJob.mutate()}
              disabled={analyzeJob.isPending || !job.description}
            >
              {analyzeJob.isPending ? 'Analyzing...' : 'Analyze Job'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateCoverLetter.mutate()}
              disabled={generateCoverLetter.isPending}
            >
              {generateCoverLetter.isPending ? 'Writing...' : 'Cover Letter'}
            </Button>
          </div>
          {!job.description && (
            <p className="text-xs text-muted-foreground">
              Add a job description to enable Analyze Job.
            </p>
          )}
          {jobAnalysis && (
            <div className="rounded-xl border border-border p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Job Analysis</span>
                {jobAnalysis.seniority && <Badge variant="outline">{jobAnalysis.seniority}</Badge>}
              </div>
              <p className="mt-2 text-muted-foreground">{jobAnalysis.summary}</p>
              {jobAnalysis.requiredSkills?.length > 0 && (
                <p className="mt-3 text-xs">
                  <span className="font-medium text-foreground">Required: </span>
                  {jobAnalysis.requiredSkills.slice(0, 8).join(', ')}
                </p>
              )}
              {jobAnalysis.responsibilities?.length > 0 && (
                <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                  {jobAnalysis.responsibilities.slice(0, 4).map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {atsResult && (
            <div className="rounded-xl border border-border p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">ATS Match</span>
                <Badge>{atsResult.score}/100</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{atsResult.summary}</p>
              {atsResult.missingSkills?.length > 0 && (
                <p className="mt-2 text-xs">
                  Missing: {atsResult.missingSkills.slice(0, 5).join(', ')}
                </p>
              )}
            </div>
          )}
          {coverLetterError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {coverLetterError}
            </p>
          )}
          {coverLetter && (
            <div className="rounded-xl border border-border p-4">
              <p className="mb-2 text-sm font-medium">Cover Letter</p>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{coverLetter}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {suggested?.questions?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Company Questions
              {suggested.matchedCompany && (
                <Badge variant="outline">{suggested.matchedCompany.name}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggested.questions.slice(0, 5).map((q) => (
              <div key={q.id} className="rounded-xl border border-border p-3 text-sm">
                <p>{q.question}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-0 text-primary"
                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                  >
                    {expandedQuestion === q.id ? 'Hide answer' : 'Show answer'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => practiceQuestion.mutate(q.id)}>
                    Mark practiced
                  </Button>
                  <Button size="sm" onClick={() => coachQuestion.mutate(q.id)} disabled={coachQuestion.isPending}>
                    AI Coach
                  </Button>
                </div>
                {expandedQuestion === q.id && q.answer && (
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {q.answer.slice(0, 1500)}
                  </pre>
                )}
                {coachResult?.questionId === q.id && (
                  <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                    <p className="font-medium">AI Coach</p>
                    <p className="mt-1 whitespace-pre-wrap">{coachResult.answer}</p>
                  </div>
                )}
              </div>
            ))}
            <Link href="/dashboard/interviews" className="text-sm text-primary hover:underline">
              Browse all interview questions →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Interview Workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label>Round title</Label>
              <Input
                value={roundTitle}
                onChange={(e) => setRoundTitle(e.target.value)}
                placeholder="Technical round"
              />
            </div>
            <div className="space-y-1">
              <Label>Scheduled</Label>
              <Input
                type="datetime-local"
                value={roundDate}
                onChange={(e) => setRoundDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input
                value={roundLocation}
                onChange={(e) => setRoundLocation(e.target.value)}
                placeholder="Zoom / Office"
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                disabled={!roundTitle.trim() || createRound.isPending}
                onClick={() => createRound.mutate()}
              >
                Add round
              </Button>
            </div>
          </div>
          <Textarea
            value={roundNotes}
            onChange={(e) => setRoundNotes(e.target.value)}
            placeholder="Prep notes for this round..."
            rows={2}
          />
          {rounds?.length ? (
            <ul className="space-y-3">
              {rounds.map((round) => (
                <li key={round.id} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{round.title}</p>
                      {round.scheduledAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(round.scheduledAt).toLocaleString()}
                          {round.location ? ` · ${round.location}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{round.status}</Badge>
                      {round.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeRound.mutate(round.id)}
                        >
                          Mark done
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteRound.mutate(round.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {round.prepNotes && (
                    <p className="mt-2 text-xs text-muted-foreground">{round.prepNotes}</p>
                  )}
                  <div className="mt-3 space-y-2">
                    <Label className="text-xs">Post-interview feedback</Label>
                    <Textarea
                      defaultValue={round.feedback ?? ''}
                      placeholder="How did the round go?"
                      rows={2}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== (round.feedback ?? '')) {
                          saveRoundFeedback.mutate({ roundId: round.id, feedback: value });
                        }
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Schedule interview rounds and attach prep notes for this job.
            </p>
          )}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateJob} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={editForm.company}
                onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Job URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={editForm.url}
                onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={6}
                placeholder="Paste the job description for AI analysis..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateJob.isPending}>
                {updateJob.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete <span className="font-medium text-foreground">{job.title}</span> at{' '}
            {job.company}? This removes notes, tags, and interview rounds for this job.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteJob.isPending}
              onClick={() => deleteJob.mutate()}
            >
              {deleteJob.isPending ? 'Deleting...' : 'Delete Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
