'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api';
import type { CareerLibrary } from '@jobos/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Skeleton,
} from '@jobos/ui';
import { Plus, Trash2 } from 'lucide-react';

export default function CareerPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('experiences');

  const { data, isLoading } = useQuery({
    queryKey: ['career'],
    queryFn: () => api.get<CareerLibrary>('/career'),
  });

  const createExperience = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/career/experiences', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] });
      setDialogOpen(false);
    },
  });

  const deleteExperience = useMutation({
    mutationFn: (id: string) => api.delete(`/career/experiences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['career'] }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createExperience.mutate({
      company: form.get('company'),
      title: form.get('title'),
      startDate: form.get('startDate'),
      endDate: form.get('endDate') || undefined,
      current: form.get('current') === 'on',
      description: form.get('description') || undefined,
      bullets: (form.get('bullets') as string)?.split('\n').filter(Boolean) || [],
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Career Library</h1>
          <p className="text-muted-foreground">Your reusable career data — the source of truth.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="experiences">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="experiences" className="space-y-4">
          {data?.experiences?.length ? (
            data.experiences.map((exp) => (
              <Card key={exp.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{exp.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} · {exp.startDate}
                      {exp.current ? ' — Present' : exp.endDate ? ` — ${exp.endDate}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteExperience.mutate(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                {exp.bullets?.length > 0 && (
                  <CardContent>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No experiences yet. Upload a resume or add manually.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {data?.projects?.length ? (
            data.projects.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.description && (
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  )}
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No projects yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {data?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg border border-border bg-muted px-3 py-1 text-sm"
                >
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No skills yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          {data?.education?.length ? (
            data.education.map((e) => (
              <Card key={e.id}>
                <CardHeader>
                  <CardTitle className="text-base">{e.degree}</CardTitle>
                  <p className="text-sm text-muted-foreground">{e.institution}</p>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No education entries yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Experience</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" placeholder="2020-01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" placeholder="2023-06" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bullets">Bullet Points (one per line)</Label>
              <Textarea id="bullets" name="bullets" rows={4} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createExperience.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
