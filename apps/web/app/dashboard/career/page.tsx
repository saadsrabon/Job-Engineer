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
import { Pencil, Plus, Trash2 } from 'lucide-react';

type EntityKey =
  | 'experiences'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certificates'
  | 'awards'
  | 'languages'
  | 'socialLinks';

type CareerItem = Record<string, string | string[] | boolean | number | null | undefined>;

const TAB_CONFIG: Record<
  EntityKey,
  { label: string; endpoint: string; addLabel: string; titleField: string; subtitleField?: string }
> = {
  experiences: {
    label: 'Experience',
    endpoint: 'experiences',
    addLabel: 'Add Experience',
    titleField: 'title',
    subtitleField: 'company',
  },
  projects: {
    label: 'Projects',
    endpoint: 'projects',
    addLabel: 'Add Project',
    titleField: 'name',
  },
  skills: { label: 'Skills', endpoint: 'skills', addLabel: 'Add Skill', titleField: 'name' },
  education: {
    label: 'Education',
    endpoint: 'education',
    addLabel: 'Add Education',
    titleField: 'degree',
    subtitleField: 'institution',
  },
  certificates: {
    label: 'Certificates',
    endpoint: 'certificates',
    addLabel: 'Add Certificate',
    titleField: 'name',
    subtitleField: 'issuer',
  },
  awards: {
    label: 'Awards',
    endpoint: 'awards',
    addLabel: 'Add Award',
    titleField: 'title',
    subtitleField: 'issuer',
  },
  languages: {
    label: 'Languages',
    endpoint: 'languages',
    addLabel: 'Add Language',
    titleField: 'name',
    subtitleField: 'proficiency',
  },
  socialLinks: {
    label: 'Links',
    endpoint: 'social-links',
    addLabel: 'Add Link',
    titleField: 'platform',
    subtitleField: 'url',
  },
};

function EntityForm({
  entity,
  initialValues,
  onSubmit,
}: {
  entity: EntityKey;
  initialValues?: CareerItem;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const value = (key: string) => {
    const v = initialValues?.[key];
    if (Array.isArray(v)) return v.join('\n');
    if (v == null) return '';
    return String(v);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};

    for (const [key, raw] of form.entries()) {
      if (key === 'bullets' || key === 'technologies') {
        data[key] = String(raw).split('\n').filter(Boolean);
      } else if (key === 'current') {
        data[key] = true;
      } else if (raw) {
        data[key] = raw;
      }
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {entity === 'experiences' && (
        <>
          <Field label="Title" name="title" required defaultValue={value('title')} />
          <Field label="Company" name="company" required defaultValue={value('company')} />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Start Date"
              name="startDate"
              placeholder="2020-01"
              required
              defaultValue={value('startDate')}
            />
            <Field
              label="End Date"
              name="endDate"
              placeholder="2023-06"
              defaultValue={value('endDate')}
            />
          </div>
          <Field
            label="Bullets (one per line)"
            name="bullets"
            textarea
            defaultValue={value('bullets')}
          />
        </>
      )}
      {entity === 'projects' && (
        <>
          <Field label="Name" name="name" required defaultValue={value('name')} />
          <Field
            label="Description"
            name="description"
            textarea
            defaultValue={value('description')}
          />
          <Field label="URL" name="url" defaultValue={value('url')} />
          <Field
            label="Technologies (one per line)"
            name="technologies"
            textarea
            defaultValue={value('technologies')}
          />
        </>
      )}
      {entity === 'skills' && (
        <>
          <Field label="Name" name="name" required defaultValue={value('name')} />
          <Field label="Category" name="category" defaultValue={value('category')} />
          <Field label="Level" name="level" defaultValue={value('level')} />
        </>
      )}
      {entity === 'education' && (
        <>
          <Field label="Degree" name="degree" required defaultValue={value('degree')} />
          <Field
            label="Institution"
            name="institution"
            required
            defaultValue={value('institution')}
          />
          <Field label="Field" name="field" defaultValue={value('field')} />
          <Field label="GPA" name="gpa" defaultValue={value('gpa')} />
        </>
      )}
      {entity === 'certificates' && (
        <>
          <Field label="Name" name="name" required defaultValue={value('name')} />
          <Field label="Issuer" name="issuer" required defaultValue={value('issuer')} />
          <Field label="Issue Date" name="issueDate" defaultValue={value('issueDate')} />
          <Field label="URL" name="url" defaultValue={value('url')} />
        </>
      )}
      {entity === 'awards' && (
        <>
          <Field label="Title" name="title" required defaultValue={value('title')} />
          <Field label="Issuer" name="issuer" defaultValue={value('issuer')} />
          <Field label="Date" name="date" defaultValue={value('date')} />
          <Field
            label="Description"
            name="description"
            textarea
            defaultValue={value('description')}
          />
        </>
      )}
      {entity === 'languages' && (
        <>
          <Field label="Language" name="name" required defaultValue={value('name')} />
          <Field
            label="Proficiency"
            name="proficiency"
            placeholder="Native, Fluent, etc."
            defaultValue={value('proficiency')}
          />
        </>
      )}
      {entity === 'socialLinks' && (
        <>
          <Field
            label="Platform"
            name="platform"
            placeholder="LinkedIn"
            required
            defaultValue={value('platform')}
          />
          <Field label="URL" name="url" required defaultValue={value('url')} />
        </>
      )}
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  textarea,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          rows={3}
          required={required}
          defaultValue={defaultValue}
        />
      ) : (
        <Input
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
}

export default function CareerPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EntityKey>('experiences');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; values: CareerItem } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['career'],
    queryFn: () => api.get<CareerLibrary>('/career'),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const createEntity = useMutation({
    mutationFn: ({ endpoint, body }: { endpoint: string; body: Record<string, unknown> }) =>
      api.post(`/career/${endpoint}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] });
      closeDialog();
    },
  });

  const updateEntity = useMutation({
    mutationFn: ({
      endpoint,
      id,
      body,
    }: {
      endpoint: string;
      id: string;
      body: Record<string, unknown>;
    }) => api.patch(`/career/${endpoint}/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] });
      closeDialog();
    },
  });

  const deleteEntity = useMutation({
    mutationFn: ({ endpoint, id }: { endpoint: string; id: string }) =>
      api.delete(`/career/${endpoint}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['career'] }),
  });

  const openCreateDialog = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: CareerItem) => {
    setEditingItem({ id: String(item.id), values: item });
    setDialogOpen(true);
  };

  const config = TAB_CONFIG[activeTab];
  const isEditing = Boolean(editingItem);

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
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          {config.addLabel}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityKey)}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {Object.entries(TAB_CONFIG).map(([key, { label }]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(TAB_CONFIG).map((key) => {
          const tabKey = key as EntityKey;
          const tabConfig = TAB_CONFIG[tabKey];
          const tabItems = (data?.[tabKey] ?? []) as unknown as CareerItem[];

          return (
            <TabsContent key={key} value={key} className="space-y-4">
              {tabKey === 'skills' && tabItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tabItems.map((item) => (
                    <span
                      key={String(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1 text-sm"
                    >
                      {String(item.name)}
                      <button
                        type="button"
                        onClick={() => openEditDialog(item)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Edit skill"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteEntity.mutate({
                            endpoint: tabConfig.endpoint,
                            id: String(item.id),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Delete skill"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : tabItems.length > 0 ? (
                tabItems.map((item) => (
                  <Card key={String(item.id)}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {String(item[tabConfig.titleField] ?? '')}
                        </CardTitle>
                        {tabConfig.subtitleField && item[tabConfig.subtitleField] && (
                          <p className="text-sm text-muted-foreground">
                            {String(item[tabConfig.subtitleField])}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          aria-label="Edit item"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteEntity.mutate({
                              endpoint: tabConfig.endpoint,
                              id: String(item.id),
                            })
                          }
                          aria-label="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                      <CardContent>
                        <ul className="list-inside list-disc space-y-1 text-sm">
                          {item.bullets.map((b, i) => (
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
                    No {tabConfig.label.toLowerCase()} yet. Upload a resume or add manually.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? `Edit ${config.label}` : config.addLabel}</DialogTitle>
          </DialogHeader>
          <EntityForm
            key={editingItem?.id ?? 'new'}
            entity={activeTab}
            initialValues={editingItem?.values}
            onSubmit={(body) => {
              if (editingItem) {
                updateEntity.mutate({
                  endpoint: config.endpoint,
                  id: editingItem.id,
                  body,
                });
              } else {
                createEntity.mutate({ endpoint: config.endpoint, body });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
