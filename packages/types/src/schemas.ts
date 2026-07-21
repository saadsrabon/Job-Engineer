import { z } from 'zod';
import { PipelineStage } from './enums';

export const createExperienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

export const createJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  source: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  stage: z.nativeEnum(PipelineStage).default(PipelineStage.Saved),
});

export const updateJobStageSchema = z.object({
  stage: z.nativeEnum(PipelineStage),
});

export const createJobNoteSchema = z.object({
  content: z.string().min(1),
});

export const createJobTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
