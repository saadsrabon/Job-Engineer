'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import Link from 'next/link';
import { useApiClient } from '@/lib/api';
import { PIPELINE_STAGES, PipelineStage } from '@jobos/types';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Skeleton,
} from '@jobos/ui';
import { Plus, LayoutGrid, Table2 } from 'lucide-react';
import { useUiStore } from '@/lib/store';
import { cn } from '@jobos/ui';

interface Job {
  id: string;
  title: string;
  company: string;
  stage: PipelineStage;
  location: string | null;
  updatedAt: string;
}

const KANBAN_STAGES = PIPELINE_STAGES;

function JobCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: { job },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <Link href={`/dashboard/jobs/${job.id}`} onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium">{job.title}</p>
        <p className="text-xs text-muted-foreground">{job.company}</p>
      </Link>
    </div>
  );
}

function KanbanColumn({ stage, jobs }: { stage: PipelineStage; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const columnJobs = jobs.filter((j) => j.stage === stage);

  return (
    <div className="flex w-56 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="truncate text-xs font-medium">{stage}</h3>
        <Badge variant="secondary">{columnJobs.length}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[400px] flex-col gap-2 rounded-xl border border-border bg-muted/30 p-2 transition-colors',
          isOver && 'border-primary bg-primary/5',
        )}
      >
        {columnJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { kanbanView, setKanbanView } = useUiStore();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get<Job[]>('/jobs'),
  });

  const updateStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) =>
      api.patch(`/jobs/${id}/stage`, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const createJob = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/jobs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setDialogOpen(false);
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs?.find((j) => j.id === event.active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over || !jobs) return;

    const jobId = active.id as string;
    const newStage = over.id as PipelineStage;
    const job = jobs.find((j) => j.id === jobId);

    if (job && job.stage !== newStage && PIPELINE_STAGES.includes(newStage)) {
      updateStage.mutate({ id: jobId, stage: newStage });
    }
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createJob.mutate({
      title: form.get('title'),
      company: form.get('company'),
      location: form.get('location') || undefined,
      url: form.get('url') || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Track applications through your pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={kanbanView === 'board' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setKanbanView('board')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={kanbanView === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setKanbanView('table')}
          >
            <Table2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : kanbanView === 'board' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_STAGES.map((stage) => (
              <KanbanColumn key={stage} stage={stage} jobs={jobs || []} />
            ))}
          </div>
          <DragOverlay>
            {activeJob ? (
              <Card className="w-72 shadow-lg">
                <CardContent className="p-3">
                  <p className="text-sm font-medium">{activeJob.title}</p>
                  <p className="text-xs text-muted-foreground">{activeJob.company}</p>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-medium">Title</th>
                  <th className="p-4 text-left font-medium">Company</th>
                  <th className="p-4 text-left font-medium">Stage</th>
                  <th className="p-4 text-left font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {jobs?.map((job) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <Link href={`/dashboard/jobs/${job.id}`} className="font-medium hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{job.company}</td>
                    <td className="p-4">
                      <Badge variant="outline">{job.stage}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(job.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Job URL</Label>
              <Input id="url" name="url" type="url" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createJob.isPending}>
                Add Job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
