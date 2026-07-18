import sampleData from "../resume.example.json";
import type { ResumeData } from "./types";

export const sampleResume = sampleData as ResumeData;

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
  sectionTitles: {
    summary: "Summary",
    education: "Education",
    experience: "Experience",
    projects: "Projects & Awards",
    skills: "Skills & Languages",
    additional: "Open Source & Volunteer",
  },
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
