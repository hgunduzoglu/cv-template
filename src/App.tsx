import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  FileText,
  LoaderCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { compileResume, type CompileOutput } from "./lib/compile";
import { createBlankResume, sampleResume } from "./sample";
import type {
  AdditionalItem,
  Education,
  Experience,
  LayoutDensity,
  Project,
  ResumeData,
  SkillGroup,
} from "./types";
import {
  EmptyState,
  Field,
  RepeaterCard,
  StringList,
  TextArea,
} from "./components/Fields";

const STORAGE_KEY = "typst-cv-builder:data:v1";

const steps = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "more", label: "More" },
] as const;

type StepId = (typeof steps)[number]["id"];

const cloneSample = () => structuredClone(sampleResume);

const normalizeData = (saved: Partial<ResumeData>): ResumeData => {
  const fallback = cloneSample();
  return {
    ...fallback,
    ...saved,
    theme: { ...fallback.theme, ...saved.theme },
    layout: { ...fallback.layout, ...saved.layout },
    contact: { ...fallback.contact, ...saved.contact },
    education: Array.isArray(saved.education) ? saved.education : fallback.education,
    experience: Array.isArray(saved.experience) ? saved.experience : fallback.experience,
    projects: Array.isArray(saved.projects) ? saved.projects : fallback.projects,
    skills: Array.isArray(saved.skills) ? saved.skills : fallback.skills,
    additional: Array.isArray(saved.additional) ? saved.additional : fallback.additional,
  };
};

const loadInitialData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeData(JSON.parse(saved) as Partial<ResumeData>) : cloneSample();
  } catch {
    return cloneSample();
  }
};

const swap = <T,>(items: T[], index: number, direction: -1 | 1) => {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const safeFileName = (name: string) => {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${normalized || "resume"}-CV.pdf`;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const toPdfBlob = (bytes: Uint8Array<ArrayBufferLike>) => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
};

export default function App() {
  const [data, setData] = useState<ResumeData>(loadInitialData);
  const [activeStep, setActiveStep] = useState<StepId>("profile");
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [compileInfo, setCompileInfo] = useState<CompileOutput>();
  const latestCompile = useRef(0);

  const currentStepIndex = steps.findIndex((step) => step.id === activeStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const compileId = ++latestCompile.current;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      setError("");
      try {
        const result = await compileResume(data);
        if (compileId !== latestCompile.current) return;

        const nextUrl = URL.createObjectURL(toPdfBlob(result.pdf));
        setPdfUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return nextUrl;
        });
        setCompileInfo(result);
        setStatus("ready");
      } catch (compileError) {
        if (compileId !== latestCompile.current) return;
        setStatus("error");
        setError(
          compileError instanceof Error
            ? compileError.message
            : "The preview could not be generated.",
        );
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [data]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );

  const sectionTitle = useMemo(
    () => steps.find((step) => step.id === activeStep)?.label ?? "Profile",
    [activeStep],
  );

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const downloadPdf = async () => {
    try {
      setStatus("loading");
      const result = await compileResume(data);
      downloadBlob(toPdfBlob(result.pdf), safeFileName(data.name));
      setCompileInfo(result);
      setStatus("ready");
    } catch (compileError) {
      setStatus("error");
      setError(
        compileError instanceof Error ? compileError.message : "The PDF could not be downloaded.",
      );
    }
  };

  const downloadJson = () => {
    downloadBlob(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      "resume.json",
    );
  };

  const resetToExample = () => {
    setData(cloneSample());
    setActiveStep("profile");
  };

  const clearAll = () => {
    setData(createBlankResume());
    setActiveStep("profile");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Typst CV Builder home">
          <span className="brand__mark"><FileText size={20} /></span>
          <span>
            <strong>Typst CV Builder</strong>
            <small>ATS-friendly by design</small>
          </span>
        </a>

        <div className="privacy-note">
          <ShieldCheck size={16} />
          <span>Your data stays in this browser</span>
        </div>

        <button className="button button--primary topbar__download" type="button" onClick={downloadPdf}>
          <Download size={17} />
          Download PDF
        </button>
      </header>

      <main className="builder" id="top">
        <section className="editor-panel" aria-label="CV editor">
          <div className="editor-intro">
            <div>
              <span className="eyebrow"><Sparkles size={14} /> Build your CV</span>
              <h1>Tell your story. Keep the format clean.</h1>
              <p>Every section is optional, reorderable, and compiled locally with Typst.</p>
            </div>
            <button className="text-button" type="button" onClick={resetToExample}>
              <RotateCcw size={14} /> Reset example
            </button>
          </div>

          <div className="progress" aria-label={`Step ${currentStepIndex + 1} of ${steps.length}`}>
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>

          <nav className="step-nav" aria-label="CV sections">
            {steps.map((step, index) => (
              <button
                type="button"
                key={step.id}
                className={activeStep === step.id ? "is-active" : ""}
                aria-current={activeStep === step.id ? "step" : undefined}
                onClick={() => setActiveStep(step.id)}
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
            ))}
          </nav>

          <div className="form-surface">
            <header className="section-heading">
              <div>
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <h2>{sectionTitle}</h2>
              </div>
              {activeStep !== "profile" && (
                <span className="section-count">
                  {activeStep === "education" && `${data.education.length} entries`}
                  {activeStep === "experience" && `${data.experience.length} entries`}
                  {activeStep === "projects" && `${data.projects.length} entries`}
                  {activeStep === "skills" && `${data.skills.length} categories`}
                  {activeStep === "more" && `${data.additional.length} entries`}
                </span>
              )}
            </header>

            {activeStep === "profile" && (
              <div className="form-grid">
                <Field label="Full name" value={data.name} placeholder="Your Name" onChange={(e) => update("name", e.target.value)} />
                <Field label="Professional title" value={data.title} placeholder="Software Engineer" onChange={(e) => update("title", e.target.value)} />
                <Field label="Location" value={data.contact.location} placeholder="City, Country" onChange={(e) => update("contact", { ...data.contact, location: e.target.value })} />
                <Field label="Email" type="email" value={data.contact.email} placeholder="you@example.com" onChange={(e) => update("contact", { ...data.contact, email: e.target.value })} />
                <Field label="Phone" value={data.contact.phone} placeholder="+00 000 000 0000" onChange={(e) => update("contact", { ...data.contact, phone: e.target.value })} />
                <Field label="CV language code" value={data.language} placeholder="en" hint="Use an ISO code such as en, tr, de, or fr." onChange={(e) => update("language", e.target.value)} />
                <Field label="GitHub label" value={data.contact.github} placeholder="github.com/username" onChange={(e) => update("contact", { ...data.contact, github: e.target.value })} />
                <Field label="GitHub URL" type="url" value={data.contact.githubUrl} placeholder="https://github.com/username" onChange={(e) => update("contact", { ...data.contact, githubUrl: e.target.value })} />
                <Field label="LinkedIn label" value={data.contact.linkedin} placeholder="linkedin.com/in/username" onChange={(e) => update("contact", { ...data.contact, linkedin: e.target.value })} />
                <Field label="LinkedIn URL" type="url" value={data.contact.linkedinUrl} placeholder="https://linkedin.com/in/username" onChange={(e) => update("contact", { ...data.contact, linkedinUrl: e.target.value })} />
                <Field label="Website label" value={data.contact.website} placeholder="yourwebsite.com" onChange={(e) => update("contact", { ...data.contact, website: e.target.value })} />
                <Field label="Website URL" type="url" value={data.contact.websiteUrl} placeholder="https://yourwebsite.com" onChange={(e) => update("contact", { ...data.contact, websiteUrl: e.target.value })} />
                <DocumentStyleControls
                  data={data}
                  onAccentChange={(accent) => update("theme", { accent })}
                  onLayoutChange={(layout) => update("layout", layout)}
                />
                <TextArea label="Professional summary" wide rows={5} value={data.summary} placeholder="Write a concise summary focused on your experience, strengths, and target role." hint="Aim for 2–4 sentences. Avoid first-person pronouns and generic claims." onChange={(e) => update("summary", e.target.value)} />
              </div>
            )}

            {activeStep === "education" && (
              <RepeaterSection
                empty="Add your education, certification, or training history."
                button="Add education"
                onAdd={() => update("education", [...data.education, { institution: "", degree: "", date: "", location: "", details: "" }])}
              >
                {data.education.map((item, index) => (
                  <RepeaterCard key={index} title={item.institution || `Education ${index + 1}`} index={index} total={data.education.length} onMove={(direction) => update("education", swap(data.education, index, direction))} onRemove={() => update("education", data.education.filter((_, i) => i !== index))}>
                    <EducationFields item={item} onChange={(next) => update("education", data.education.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "experience" && (
              <RepeaterSection
                empty="Add a role and describe outcomes, not just responsibilities."
                button="Add experience"
                onAdd={() => update("experience", [...data.experience, { role: "", organization: "", date: "", location: "", bullets: [""] }])}
              >
                {data.experience.map((item, index) => (
                  <RepeaterCard key={index} title={item.role || `Experience ${index + 1}`} index={index} total={data.experience.length} onMove={(direction) => update("experience", swap(data.experience, index, direction))} onRemove={() => update("experience", data.experience.filter((_, i) => i !== index))}>
                    <ExperienceFields item={item} onChange={(next) => update("experience", data.experience.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "projects" && (
              <RepeaterSection
                empty="Add a project, award, publication, or meaningful side project."
                button="Add project"
                onAdd={() => update("projects", [...data.projects, { name: "", date: "", url: "", bullets: [""] }])}
              >
                {data.projects.map((item, index) => (
                  <RepeaterCard key={index} title={item.name || `Project ${index + 1}`} index={index} total={data.projects.length} onMove={(direction) => update("projects", swap(data.projects, index, direction))} onRemove={() => update("projects", data.projects.filter((_, i) => i !== index))}>
                    <ProjectFields item={item} onChange={(next) => update("projects", data.projects.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "skills" && (
              <RepeaterSection
                empty="Create any categories you need: Programming, Tools, Languages, Cloud, and more."
                button="Add skill category"
                onAdd={() => update("skills", [...data.skills, { category: "", items: [""] }])}
              >
                {data.skills.map((item, index) => (
                  <RepeaterCard key={index} title={item.category || `Skill category ${index + 1}`} index={index} total={data.skills.length} onMove={(direction) => update("skills", swap(data.skills, index, direction))} onRemove={() => update("skills", data.skills.filter((_, i) => i !== index))}>
                    <SkillFields item={item} onChange={(next) => update("skills", data.skills.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "more" && (
              <RepeaterSection
                empty="Optionally add open-source work, volunteering, or community involvement."
                button="Add entry"
                onAdd={() => update("additional", [...data.additional, { name: "", description: "" }])}
              >
                {data.additional.map((item, index) => (
                  <RepeaterCard key={index} title={item.name || `Entry ${index + 1}`} index={index} total={data.additional.length} onMove={(direction) => update("additional", swap(data.additional, index, direction))} onRemove={() => update("additional", data.additional.filter((_, i) => i !== index))}>
                    <AdditionalFields item={item} onChange={(next) => update("additional", data.additional.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            <footer className="form-footer">
              <button className="button button--ghost" type="button" disabled={currentStepIndex === 0} onClick={() => setActiveStep(steps[currentStepIndex - 1].id)}>
                <ChevronLeft size={16} /> Back
              </button>
              <div className="form-footer__end">
                <button className="text-button text-button--danger" type="button" onClick={clearAll}>Clear all</button>
                {currentStepIndex < steps.length - 1 ? (
                  <button className="button button--primary" type="button" onClick={() => setActiveStep(steps[currentStepIndex + 1].id)}>
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="button button--primary" type="button" onClick={downloadPdf}>
                    <Download size={16} /> Download PDF
                  </button>
                )}
              </div>
            </footer>
          </div>
        </section>

        <aside className="preview-panel" aria-label="CV preview">
          <header className="preview-toolbar">
            <div>
              <strong>Live preview</strong>
              <span className={`compile-status compile-status--${status === "ready" && compileInfo && compileInfo.pageCount > 1 ? "warning" : status}`}>
                {status === "loading" && <><LoaderCircle size={13} className="spin" /> Updating</>}
                {status === "ready" && compileInfo && compileInfo.pageCount > 1 && <><TriangleAlert size={13} /> {compileInfo.pageCount} pages</>}
                {status === "ready" && compileInfo && compileInfo.pageCount <= 1 && <><Check size={13} /> 1 page{compileInfo.autoFitted ? ` · fitted ${compileInfo.appliedFontSize.toFixed(1)} pt` : ""}</>}
                {status === "ready" && !compileInfo && <><Check size={13} /> Ready</>}
                {status === "error" && <>Needs attention</>}
              </span>
            </div>
            <div className="preview-actions">
              <button className="icon-button icon-button--labeled" type="button" onClick={downloadJson} title="Download editable data">
                <FileJson size={16} /> JSON
              </button>
              <button className="button button--primary button--small" type="button" onClick={downloadPdf}>
                <Download size={15} /> PDF
              </button>
            </div>
          </header>

          <div className="preview-stage">
            {status === "error" ? (
              <div className="preview-message preview-message--error">
                <strong>Preview unavailable</strong>
                <p>{error}</p>
              </div>
            ) : pdfUrl ? (
              <iframe title="Generated CV preview" src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`} />
            ) : (
              <div className="preview-message">
                <LoaderCircle size={26} className="spin" />
                <strong>Preparing the Typst compiler</strong>
                <p>The first preview may take a moment. Future updates are faster.</p>
              </div>
            )}
          </div>

          <footer className="preview-footer">
            {compileInfo && compileInfo.pageCount > 1 ? (
              <><TriangleAlert size={14} /> {compileInfo.fitFailed ? "Still over one page at the readable minimum. Shorten or remove content." : "This CV uses multiple pages. Enable one-page fitting or tighten the content."}</>
            ) : (
              <><ShieldCheck size={14} /> No account, uploads, or server-side storage.</>
            )}
          </footer>
        </aside>
      </main>
    </div>
  );
}

function DocumentStyleControls({
  data,
  onAccentChange,
  onLayoutChange,
}: {
  data: ResumeData;
  onAccentChange: (accent: string) => void;
  onLayoutChange: (layout: ResumeData["layout"]) => void;
}) {
  const densities: { value: LayoutDensity; label: string }[] = [
    { value: "standard", label: "Standard" },
    { value: "compact", label: "Compact" },
    { value: "dense", label: "Extra compact" },
  ];

  return (
    <section className="document-style field--wide" aria-labelledby="document-style-heading">
      <header>
        <div>
          <span className="field__label" id="document-style-heading">Document style</span>
          <p>Change the complete PDF without editing the Typst layout.</p>
        </div>
        <span className="style-chip">A4 · ATS</span>
      </header>

      <div className="document-style__grid">
        <label className="field">
          <span className="field__label">Font family</span>
          <select
            value={data.layout.fontFamily}
            onChange={(event) => onLayoutChange({
              ...data.layout,
              fontFamily: event.target.value as ResumeData["layout"]["fontFamily"],
            })}
          >
            <option value="Inter">Inter</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Accent color</span>
          <span className="color-control">
            <input
              type="color"
              value={data.theme.accent}
              aria-label="CV accent color"
              onChange={(event) => onAccentChange(event.target.value)}
            />
            <output>{data.theme.accent.toUpperCase()}</output>
          </span>
        </label>

        <label className="field field--wide">
          <span className="range-heading">
            <span className="field__label">Base font size</span>
            <output>{data.layout.fontSize.toFixed(1)} pt</output>
          </span>
          <input
            className="range-input"
            type="range"
            min="7.4"
            max="10.5"
            step="0.1"
            value={data.layout.fontSize}
            onChange={(event) => onLayoutChange({
              ...data.layout,
              fontSize: Number(event.target.value),
            })}
          />
          <span className="range-labels"><span>More space</span><span>Larger text</span></span>
        </label>

        <div className="field field--wide">
          <span className="field__label">Layout spacing</span>
          <div className="density-options" role="group" aria-label="Layout spacing">
            {densities.map((density) => (
              <button
                type="button"
                key={density.value}
                className={data.layout.density === density.value ? "is-selected" : ""}
                aria-pressed={data.layout.density === density.value}
                onClick={() => onLayoutChange({ ...data.layout, density: density.value })}
              >
                {density.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="fit-toggle">
        <input
          type="checkbox"
          checked={data.layout.autoFit}
          onChange={(event) => onLayoutChange({ ...data.layout, autoFit: event.target.checked })}
        />
        <span>
          <strong>Keep it to one page</strong>
          <small>When needed, spacing and type shrink automatically, never below 7.4 pt.</small>
        </span>
      </label>
    </section>
  );
}

function RepeaterSection({ children, empty, button, onAdd }: { children: React.ReactNode; empty: string; button: string; onAdd: () => void }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="repeater-stack">
      {!hasChildren && <EmptyState>{empty}</EmptyState>}
      {children}
      <button className="button button--add" type="button" onClick={onAdd}>
        <Plus size={16} /> {button}
      </button>
    </div>
  );
}

function EducationFields({ item, onChange }: { item: Education; onChange: (item: Education) => void }) {
  return <div className="form-grid">
    <Field label="Institution" value={item.institution} placeholder="University Name" onChange={(e) => onChange({ ...item, institution: e.target.value })} />
    <Field label="Degree or certification" value={item.degree} placeholder="B.Sc. in Computer Science" onChange={(e) => onChange({ ...item, degree: e.target.value })} />
    <Field label="Date" value={item.date} placeholder="2020 – 2024" onChange={(e) => onChange({ ...item, date: e.target.value })} />
    <Field label="Location" value={item.location} placeholder="City, Country" onChange={(e) => onChange({ ...item, location: e.target.value })} />
    <TextArea wide label="Details (optional)" rows={2} value={item.details} placeholder="Honors, relevant coursework, or a concise highlight." onChange={(e) => onChange({ ...item, details: e.target.value })} />
  </div>;
}

function ExperienceFields({ item, onChange }: { item: Experience; onChange: (item: Experience) => void }) {
  return <div className="form-grid">
    <Field label="Role" value={item.role} placeholder="Software Engineer" onChange={(e) => onChange({ ...item, role: e.target.value })} />
    <Field label="Organization" value={item.organization} placeholder="Company Name" onChange={(e) => onChange({ ...item, organization: e.target.value })} />
    <Field label="Date" value={item.date} placeholder="Jan 2024 – Present" onChange={(e) => onChange({ ...item, date: e.target.value })} />
    <Field label="Location" value={item.location} placeholder="Remote" onChange={(e) => onChange({ ...item, location: e.target.value })} />
    <StringList label="Achievement bullets" values={item.bullets} placeholder="Start with an action verb and include a measurable result when possible." addLabel="Add bullet" onChange={(bullets) => onChange({ ...item, bullets })} />
  </div>;
}

function ProjectFields({ item, onChange }: { item: Project; onChange: (item: Project) => void }) {
  return <div className="form-grid">
    <Field label="Project or award name" value={item.name} placeholder="Project Name" onChange={(e) => onChange({ ...item, name: e.target.value })} />
    <Field label="Date" value={item.date} placeholder="2024 – Present" onChange={(e) => onChange({ ...item, date: e.target.value })} />
    <Field wide label="Project URL (optional)" type="url" value={item.url} placeholder="https://github.com/username/project" onChange={(e) => onChange({ ...item, url: e.target.value })} />
    <StringList label="Project bullets" values={item.bullets} placeholder="Describe the problem, your contribution, the stack, and the result." addLabel="Add bullet" onChange={(bullets) => onChange({ ...item, bullets })} />
  </div>;
}

function SkillFields({ item, onChange }: { item: SkillGroup; onChange: (item: SkillGroup) => void }) {
  return <div className="form-grid">
    <Field wide label="Category name" value={item.category} placeholder="Programming, Cloud, Languages…" onChange={(e) => onChange({ ...item, category: e.target.value })} />
    <StringList label="Skills" values={item.items} placeholder="TypeScript" addLabel="Add skill" onChange={(items) => onChange({ ...item, items })} />
  </div>;
}

function AdditionalFields({ item, onChange }: { item: AdditionalItem; onChange: (item: AdditionalItem) => void }) {
  return <div className="form-grid">
    <Field wide label="Project, organization, or community" value={item.name} placeholder="Open-source project or community" onChange={(e) => onChange({ ...item, name: e.target.value })} />
    <TextArea wide label="Description" rows={3} value={item.description} placeholder="Describe your contribution in one concise line." onChange={(e) => onChange({ ...item, description: e.target.value })} />
  </div>;
}
