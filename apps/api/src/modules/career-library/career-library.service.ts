import { Injectable } from '@nestjs/common';
import { CareerLibraryRepository } from './career-library.repository';

@Injectable()
export class CareerLibraryService {
  constructor(private repository: CareerLibraryRepository) {}

  getAll(userId: string) {
    return this.repository.getAll(userId);
  }

  importParsedData(userId: string, data: Record<string, unknown[]>) {
    return this.repository.importParsedData(userId, data);
  }

  createExperience(userId: string, data: object) {
    return this.repository.createExperience(userId, data as Record<string, unknown>);
  }

  updateExperience(userId: string, id: string, data: object) {
    return this.repository.updateExperience(userId, id, data as Record<string, unknown>);
  }

  deleteExperience(userId: string, id: string) {
    return this.repository.deleteExperience(userId, id);
  }

  createProject(userId: string, data: object) {
    return this.repository.createProject(userId, data as Record<string, unknown>);
  }

  updateProject(userId: string, id: string, data: object) {
    return this.repository.updateProject(userId, id, data as Record<string, unknown>);
  }

  deleteProject(userId: string, id: string) {
    return this.repository.deleteProject(userId, id);
  }

  createSkill(userId: string, data: object) {
    return this.repository.createSkill(userId, data as Record<string, unknown>);
  }

  updateSkill(userId: string, id: string, data: object) {
    return this.repository.updateSkill(userId, id, data as Record<string, unknown>);
  }

  deleteSkill(userId: string, id: string) {
    return this.repository.deleteSkill(userId, id);
  }

  createEducation(userId: string, data: object) {
    return this.repository.createEducation(userId, data as Record<string, unknown>);
  }

  updateEducation(userId: string, id: string, data: object) {
    return this.repository.updateEducation(userId, id, data as Record<string, unknown>);
  }

  deleteEducation(userId: string, id: string) {
    return this.repository.deleteEducation(userId, id);
  }
}
