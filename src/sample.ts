import sampleData from "../resume.example.json";
import type { ResumeData } from "./types";

export const sampleResume = sampleData as ResumeData;

export const defaultSectionTitles = {
  en: {
    summary: "Summary",
    education: "Education",
    experience: "Experience",
    projects: "Projects & Awards",
    skills: "Skills & Languages",
    additional: "Open Source & Volunteer",
  },
  tr: {
    summary: "Özet",
    education: "Eğitim",
    experience: "Deneyim",
    projects: "Projeler ve Ödüller",
    skills: "Beceriler ve Diller",
    additional: "Açık Kaynak ve Gönüllülük",
  },
} as const satisfies Record<"en" | "tr", ResumeData["sectionTitles"]>;

export const createBlankResume = (): ResumeData => ({
  name: "",
  title: "",
  language: "en",
  theme: { accent: "#7E2A3B" },
  layout: {
    fontFamily: "Inter",
    fontSize: 9.2,
    density: "standard",
    autoFit: true,
  },
  sectionTitles: { ...defaultSectionTitles.en },
  contact: {
    location: "",
    email: "",
    phone: "",
    github: "",
    githubUrl: "",
    linkedin: "",
    linkedinUrl: "",
    website: "",
    websiteUrl: "",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  additional: [],
  customSections: [],
});
