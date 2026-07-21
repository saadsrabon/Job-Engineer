export interface Experience {
  id: string;
  userId: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  bullets: string[];
  order: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  technologies: string[];
  bullets: string[];
  order: number;
}

export interface Education {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  gpa: string | null;
  description: string | null;
  order: number;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  level: string | null;
  order: number;
}

export interface Certificate {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  issueDate: string | null;
  expiryDate: string | null;
  url: string | null;
  order: number;
}

export interface Award {
  id: string;
  userId: string;
  title: string;
  issuer: string | null;
  date: string | null;
  description: string | null;
  order: number;
}

export interface Language {
  id: string;
  userId: string;
  name: string;
  proficiency: string | null;
  order: number;
}

export interface SocialLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
  order: number;
}

export interface CareerLibrary {
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skill[];
  certificates: Certificate[];
  awards: Award[];
  languages: Language[];
  socialLinks: SocialLink[];
}

export interface ParsedResumeData {
  experiences: Omit<Experience, 'id' | 'userId' | 'order'>[];
  projects: Omit<Project, 'id' | 'userId' | 'order'>[];
  education: Omit<Education, 'id' | 'userId' | 'order'>[];
  skills: Omit<Skill, 'id' | 'userId' | 'order'>[];
  certificates: Omit<Certificate, 'id' | 'userId' | 'order'>[];
  awards: Omit<Award, 'id' | 'userId' | 'order'>[];
  languages: Omit<Language, 'id' | 'userId' | 'order'>[];
  socialLinks: Omit<SocialLink, 'id' | 'userId' | 'order'>[];
}
