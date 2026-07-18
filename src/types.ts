export interface Contact {
  location: string;
  email: string;
  phone: string;
  github: string;
  githubUrl: string;
  linkedin: string;
  linkedinUrl: string;
  website: string;
  websiteUrl: string;
}

export interface Education {
  institution: string;
  degree: string;
  date: string;
  location: string;
  details: string;
}

export interface Experience {
  role: string;
  organization: string;
  date: string;
  location: string;
  bullets: string[];
}

export interface Project {
  name: string;
  date: string;
  url: string;
  bullets: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface AdditionalItem {
  name: string;
  description: string;
}

export type LayoutDensity = "standard" | "compact" | "dense";

export interface ResumeLayout {
  fontFamily: "Inter" | "JetBrains Mono";
  fontSize: number;
  density: LayoutDensity;
  autoFit: boolean;
}

export interface SectionTitles {
  summary: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
  additional: string;
}

export interface ResumeData {
  name: string;
  title: string;
  language: string;
  theme: { accent: string };
  layout: ResumeLayout;
  sectionTitles: SectionTitles;
  contact: Contact;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  additional: AdditionalItem[];
}
