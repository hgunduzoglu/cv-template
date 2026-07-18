import { useEffect, useRef, useState } from "react";
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
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { compileResume, type CompileOutput } from "./lib/compile";
import { createBlankResume, defaultSectionTitles, sampleResume } from "./sample";
import { uiCopy, type UiCopy, type UiLanguage } from "./i18n";
import type {
  AdditionalItem,
  CustomSection,
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
const UI_LANGUAGE_KEY = "typst-cv-builder:ui-language";

const steps = [
  { id: "profile" },
  { id: "education" },
  { id: "experience" },
  { id: "projects" },
  { id: "skills" },
  { id: "more" },
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
    sectionTitles: { ...fallback.sectionTitles, ...saved.sectionTitles },
    contact: { ...fallback.contact, ...saved.contact },
    education: Array.isArray(saved.education) ? saved.education : fallback.education,
    experience: Array.isArray(saved.experience) ? saved.experience : fallback.experience,
    projects: Array.isArray(saved.projects) ? saved.projects : fallback.projects,
    skills: Array.isArray(saved.skills) ? saved.skills : fallback.skills,
    additional: Array.isArray(saved.additional) ? saved.additional : fallback.additional,
    customSections: Array.isArray(saved.customSections) ? saved.customSections : fallback.customSections,
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

const loadInitialUiLanguage = (): UiLanguage => {
  const saved = localStorage.getItem(UI_LANGUAGE_KEY);
  if (saved === "en" || saved === "tr") return saved;
  return navigator.language.toLocaleLowerCase().startsWith("tr") ? "tr" : "en";
};

const localizeResumeDefaults = (resume: ResumeData, language: UiLanguage): ResumeData => {
  const sourceLanguage: UiLanguage = language === "tr" ? "en" : "tr";
  const sourceTitles = defaultSectionTitles[sourceLanguage];
  const targetTitles = defaultSectionTitles[language];
  const sectionTitles = { ...resume.sectionTitles };

  for (const key of Object.keys(sectionTitles) as (keyof ResumeData["sectionTitles"])[]) {
    if (sectionTitles[key] === sourceTitles[key]) {
      sectionTitles[key] = targetTitles[key];
    }
  }

  return {
    ...resume,
    language: resume.language === sourceLanguage ? language : resume.language,
    sectionTitles,
  };
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
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>(loadInitialUiLanguage);
  const [data, setData] = useState<ResumeData>(() => localizeResumeDefaults(loadInitialData(), uiLanguage));
  const [activeStep, setActiveStep] = useState<StepId>("profile");
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [compileInfo, setCompileInfo] = useState<CompileOutput>();
  const latestCompile = useRef(0);
  const copy = uiCopy[uiLanguage];

  const currentStepIndex = steps.findIndex((step) => step.id === activeStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(UI_LANGUAGE_KEY, uiLanguage);
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

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
          uiLanguage === "en" && compileError instanceof Error
            ? compileError.message
            : copy.previewError,
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

  const sectionTitlesByStep: Record<StepId, string> = {
    profile: copy.profileStep,
    education: data.sectionTitles.education || copy.educationStep,
    experience: data.sectionTitles.experience || copy.experienceStep,
    projects: data.sectionTitles.projects || copy.projectsStep,
    skills: data.sectionTitles.skills || copy.skillsStep,
    more: data.sectionTitles.additional || copy.moreStep,
  };
  const sectionTitle = sectionTitlesByStep[activeStep];
  const stepLabel = uiLanguage === "tr"
    ? `${steps.length} adımın ${currentStepIndex + 1}. adımı`
    : `Step ${currentStepIndex + 1} of ${steps.length}`;
  const entriesLabel = (count: number) => uiLanguage === "tr"
    ? `${count} kayıt`
    : `${count} ${count === 1 ? "entry" : "entries"}`;
  const categoriesLabel = (count: number) => uiLanguage === "tr"
    ? `${count} kategori`
    : `${count} ${count === 1 ? "category" : "categories"}`;
  const customSectionsLabel = (count: number) => uiLanguage === "tr"
    ? `${count} özel bölüm`
    : `${count} custom ${count === 1 ? "section" : "sections"}`;

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const changeUiLanguage = (language: UiLanguage) => {
    setUiLanguage(language);
    setData((current) => localizeResumeDefaults(current, language));
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
        uiLanguage === "en" && compileError instanceof Error ? compileError.message : copy.pdfError,
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
    setData(localizeResumeDefaults(cloneSample(), uiLanguage));
    setActiveStep("profile");
  };

  const clearAll = () => {
    setData(localizeResumeDefaults(createBlankResume(), uiLanguage));
    setActiveStep("profile");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label={copy.brandHomeAria}>
          <span className="brand__mark"><FileText size={20} /></span>
          <span>
            <strong>{copy.brandName}</strong>
            <small>{copy.brandTagline}</small>
          </span>
        </a>

        <div className="privacy-note">
          <ShieldCheck size={16} />
          <span>{copy.privacyNote}</span>
        </div>

        <div className="topbar__actions">
          <div className="language-switcher" role="group" aria-label={copy.languageSwitcher}>
            <button type="button" className={uiLanguage === "en" ? "is-active" : ""} aria-pressed={uiLanguage === "en"} title={copy.english} onClick={() => changeUiLanguage("en")}>EN</button>
            <button type="button" className={uiLanguage === "tr" ? "is-active" : ""} aria-pressed={uiLanguage === "tr"} title={copy.turkish} onClick={() => changeUiLanguage("tr")}>TR</button>
          </div>
          <button className="button button--primary topbar__download" type="button" onClick={downloadPdf}>
            <Download size={17} />
            {copy.downloadPdf}
          </button>
        </div>
      </header>

      <main className="builder" id="top">
        <section className="editor-panel" aria-label={copy.editorAria}>
          <div className="editor-intro">
            <div>
              <span className="eyebrow"><Sparkles size={14} /> {copy.buildCv}</span>
              <h1>{copy.heroTitle}</h1>
              <p>{copy.heroDescription}</p>
            </div>
            <button className="text-button" type="button" onClick={resetToExample}>
              <RotateCcw size={14} /> {copy.resetExample}
            </button>
          </div>

          <div className="progress" aria-label={stepLabel}>
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>

          <nav className="step-nav" aria-label={copy.cvSectionsAria}>
            {steps.map((step, index) => (
              <button
                type="button"
                key={step.id}
                className={activeStep === step.id ? "is-active" : ""}
                aria-current={activeStep === step.id ? "step" : undefined}
                onClick={() => setActiveStep(step.id)}
              >
                <span className="step-nav__number">{index + 1}</span>
                <span className="step-nav__label">{sectionTitlesByStep[step.id]}</span>
              </button>
            ))}
          </nav>

          <div className="form-surface">
            <header className="section-heading">
              <div>
                <span>{stepLabel}</span>
                <h2>{sectionTitle}</h2>
              </div>
              {activeStep !== "profile" && (
                <span className="section-count">
                  {activeStep === "education" && entriesLabel(data.education.length)}
                  {activeStep === "experience" && entriesLabel(data.experience.length)}
                  {activeStep === "projects" && entriesLabel(data.projects.length)}
                  {activeStep === "skills" && categoriesLabel(data.skills.length)}
                  {activeStep === "more" && `${entriesLabel(data.additional.length)} · ${customSectionsLabel(data.customSections.length)}`}
                </span>
              )}
            </header>

            {activeStep === "profile" && (
              <div className="form-grid">
                <Field label={copy.fullName} value={data.name} placeholder={copy.yourName} onChange={(e) => update("name", e.target.value)} />
                <Field label={copy.professionalTitle} value={data.title} placeholder={copy.softwareEngineer} onChange={(e) => update("title", e.target.value)} />
                <Field label={copy.location} value={data.contact.location} placeholder={copy.cityCountry} onChange={(e) => update("contact", { ...data.contact, location: e.target.value })} />
                <Field label={copy.email} type="email" value={data.contact.email} placeholder={copy.emailPlaceholder} onChange={(e) => update("contact", { ...data.contact, email: e.target.value })} />
                <Field label={copy.phone} value={data.contact.phone} placeholder="+00 000 000 0000" onChange={(e) => update("contact", { ...data.contact, phone: e.target.value })} />
                <Field label={copy.cvLanguageCode} value={data.language} placeholder="en" hint={copy.languageCodeHint} onChange={(e) => update("language", e.target.value)} />
                <Field label={copy.githubLabel} value={data.contact.github} placeholder="github.com/username" onChange={(e) => update("contact", { ...data.contact, github: e.target.value })} />
                <Field label={copy.githubUrl} type="url" value={data.contact.githubUrl} placeholder="https://github.com/username" onChange={(e) => update("contact", { ...data.contact, githubUrl: e.target.value })} />
                <Field label={copy.linkedinLabel} value={data.contact.linkedin} placeholder="linkedin.com/in/username" onChange={(e) => update("contact", { ...data.contact, linkedin: e.target.value })} />
                <Field label={copy.linkedinUrl} type="url" value={data.contact.linkedinUrl} placeholder="https://linkedin.com/in/username" onChange={(e) => update("contact", { ...data.contact, linkedinUrl: e.target.value })} />
                <Field label={copy.websiteLabel} value={data.contact.website} placeholder="yourwebsite.com" onChange={(e) => update("contact", { ...data.contact, website: e.target.value })} />
                <Field label={copy.websiteUrl} type="url" value={data.contact.websiteUrl} placeholder="https://yourwebsite.com" onChange={(e) => update("contact", { ...data.contact, websiteUrl: e.target.value })} />
                <DocumentStyleControls
                  data={data}
                  copy={copy}
                  onAccentChange={(accent) => update("theme", { accent })}
                  onLayoutChange={(layout) => update("layout", layout)}
                />
                <Field label={copy.summarySectionTitle} wide value={data.sectionTitles.summary} placeholder={copy.summary} onChange={(e) => update("sectionTitles", { ...data.sectionTitles, summary: e.target.value })} />
                <TextArea label={copy.professionalSummary} wide rows={5} value={data.summary} placeholder={copy.summaryPlaceholder} hint={copy.summaryHint} onChange={(e) => update("summary", e.target.value)} />
              </div>
            )}

            {activeStep === "education" && (
              <RepeaterSection
                copy={copy}
                title={data.sectionTitles.education}
                titlePlaceholder={copy.educationStep}
                onTitleChange={(title) => update("sectionTitles", { ...data.sectionTitles, education: title })}
                empty={copy.educationEmpty}
                button={copy.addEducation}
                onAdd={() => update("education", [...data.education, { institution: "", degree: "", date: "", location: "", details: "" }])}
              >
                {data.education.map((item, index) => (
                  <RepeaterCard key={index} language={uiLanguage} title={item.institution || `${copy.educationEntry} ${index + 1}`} index={index} total={data.education.length} onMove={(direction) => update("education", swap(data.education, index, direction))} onRemove={() => update("education", data.education.filter((_, i) => i !== index))}>
                    <EducationFields copy={copy} item={item} onChange={(next) => update("education", data.education.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "experience" && (
              <RepeaterSection
                copy={copy}
                title={data.sectionTitles.experience}
                titlePlaceholder={copy.experienceStep}
                onTitleChange={(title) => update("sectionTitles", { ...data.sectionTitles, experience: title })}
                empty={copy.experienceEmpty}
                button={copy.addExperience}
                onAdd={() => update("experience", [...data.experience, { role: "", organization: "", date: "", location: "", bullets: [""] }])}
              >
                {data.experience.map((item, index) => (
                  <RepeaterCard key={index} language={uiLanguage} title={item.role || `${copy.experienceEntry} ${index + 1}`} index={index} total={data.experience.length} onMove={(direction) => update("experience", swap(data.experience, index, direction))} onRemove={() => update("experience", data.experience.filter((_, i) => i !== index))}>
                    <ExperienceFields copy={copy} language={uiLanguage} item={item} onChange={(next) => update("experience", data.experience.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "projects" && (
              <RepeaterSection
                copy={copy}
                title={data.sectionTitles.projects}
                titlePlaceholder={copy.projectsTitlePlaceholder}
                onTitleChange={(title) => update("sectionTitles", { ...data.sectionTitles, projects: title })}
                empty={copy.projectsEmpty}
                button={copy.addProject}
                onAdd={() => update("projects", [...data.projects, { name: "", date: "", url: "", bullets: [""] }])}
              >
                {data.projects.map((item, index) => (
                  <RepeaterCard key={index} language={uiLanguage} title={item.name || `${copy.projectEntry} ${index + 1}`} index={index} total={data.projects.length} onMove={(direction) => update("projects", swap(data.projects, index, direction))} onRemove={() => update("projects", data.projects.filter((_, i) => i !== index))}>
                    <ProjectFields copy={copy} language={uiLanguage} item={item} onChange={(next) => update("projects", data.projects.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "skills" && (
              <RepeaterSection
                copy={copy}
                title={data.sectionTitles.skills}
                titlePlaceholder={copy.skillsTitlePlaceholder}
                onTitleChange={(title) => update("sectionTitles", { ...data.sectionTitles, skills: title })}
                empty={copy.skillsEmpty}
                button={copy.addSkillCategory}
                onAdd={() => update("skills", [...data.skills, { category: "", items: [""] }])}
              >
                {data.skills.map((item, index) => (
                  <RepeaterCard key={index} language={uiLanguage} title={item.category || `${copy.skillCategoryEntry} ${index + 1}`} index={index} total={data.skills.length} onMove={(direction) => update("skills", swap(data.skills, index, direction))} onRemove={() => update("skills", data.skills.filter((_, i) => i !== index))}>
                    <SkillFields copy={copy} language={uiLanguage} item={item} onChange={(next) => update("skills", data.skills.map((entry, i) => i === index ? next : entry))} />
                  </RepeaterCard>
                ))}
              </RepeaterSection>
            )}

            {activeStep === "more" && (
              <>
                <RepeaterSection
                  copy={copy}
                  title={data.sectionTitles.additional}
                  titlePlaceholder={copy.additionalTitlePlaceholder}
                  onTitleChange={(title) => update("sectionTitles", { ...data.sectionTitles, additional: title })}
                  empty={copy.additionalEmpty}
                  button={copy.addEntry}
                  onAdd={() => update("additional", [...data.additional, { name: "", description: "" }])}
                >
                  {data.additional.map((item, index) => (
                    <RepeaterCard key={index} language={uiLanguage} title={item.name || `${copy.entry} ${index + 1}`} index={index} total={data.additional.length} onMove={(direction) => update("additional", swap(data.additional, index, direction))} onRemove={() => update("additional", data.additional.filter((_, i) => i !== index))}>
                      <AdditionalFields copy={copy} item={item} onChange={(next) => update("additional", data.additional.map((entry, i) => i === index ? next : entry))} />
                    </RepeaterCard>
                  ))}
                </RepeaterSection>
                <CustomSectionsEditor
                  copy={copy}
                  language={uiLanguage}
                  sections={data.customSections}
                  onChange={(customSections) => update("customSections", customSections)}
                />
              </>
            )}

            <footer className="form-footer">
              <button className="button button--ghost" type="button" disabled={currentStepIndex === 0} onClick={() => setActiveStep(steps[currentStepIndex - 1].id)}>
                <ChevronLeft size={16} /> {copy.back}
              </button>
              <div className="form-footer__end">
                <button className="text-button text-button--danger" type="button" onClick={clearAll}>{copy.clearAll}</button>
                {currentStepIndex < steps.length - 1 ? (
                  <button className="button button--primary" type="button" onClick={() => setActiveStep(steps[currentStepIndex + 1].id)}>
                    {copy.continue} <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="button button--primary" type="button" onClick={downloadPdf}>
                    <Download size={16} /> {copy.downloadPdf}
                  </button>
                )}
              </div>
            </footer>
          </div>
        </section>

        <aside className="preview-panel" aria-label={copy.previewAria}>
          <header className="preview-toolbar">
            <div>
              <strong>{copy.livePreview}</strong>
              <span className={`compile-status compile-status--${status === "ready" && compileInfo && compileInfo.pageCount > 1 ? "warning" : status}`}>
                {status === "loading" && <><LoaderCircle size={13} className="spin" /> {copy.updating}</>}
                {status === "ready" && compileInfo && compileInfo.pageCount > 1 && <><TriangleAlert size={13} /> {uiLanguage === "tr" ? `${compileInfo.pageCount} sayfa` : `${compileInfo.pageCount} pages`}</>}
                {status === "ready" && compileInfo && compileInfo.pageCount <= 1 && <><Check size={13} /> {uiLanguage === "tr" ? "1 sayfa" : "1 page"}{compileInfo.autoFitted ? ` · ${uiLanguage === "tr" ? "sığdırıldı" : "fitted"} ${compileInfo.appliedFontSize.toFixed(1)} pt` : ""}</>}
                {status === "ready" && !compileInfo && <><Check size={13} /> {copy.ready}</>}
                {status === "error" && <>{copy.needsAttention}</>}
              </span>
            </div>
            <div className="preview-actions">
              <button className="icon-button icon-button--labeled" type="button" onClick={downloadJson} title={copy.downloadEditableData}>
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
                <strong>{copy.previewUnavailable}</strong>
                <p>{error}</p>
              </div>
            ) : pdfUrl ? (
              <iframe title={copy.generatedPreview} src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`} />
            ) : (
              <div className="preview-message">
                <LoaderCircle size={26} className="spin" />
                <strong>{copy.preparingCompiler}</strong>
                <p>{copy.compilerWait}</p>
              </div>
            )}
          </div>

          <footer className="preview-footer">
            {compileInfo && compileInfo.pageCount > 1 ? (
              <><TriangleAlert size={14} /> {compileInfo.fitFailed ? copy.fitFailed : copy.multiplePages}</>
            ) : (
              <><ShieldCheck size={14} /> {copy.noStorage}</>
            )}
          </footer>
        </aside>
      </main>
      <Analytics />
    </div>
  );
}

function DocumentStyleControls({
  data,
  copy,
  onAccentChange,
  onLayoutChange,
}: {
  data: ResumeData;
  copy: UiCopy;
  onAccentChange: (accent: string) => void;
  onLayoutChange: (layout: ResumeData["layout"]) => void;
}) {
  const densities: { value: LayoutDensity; label: string }[] = [
    { value: "standard", label: copy.standard },
    { value: "compact", label: copy.compact },
    { value: "dense", label: copy.extraCompact },
  ];

  return (
    <section className="document-style field--wide" aria-labelledby="document-style-heading">
      <header>
        <div>
          <span className="field__label" id="document-style-heading">{copy.documentStyle}</span>
          <p>{copy.documentStyleDescription}</p>
        </div>
        <span className="style-chip">A4 · ATS</span>
      </header>

      <div className="document-style__grid">
        <label className="field">
          <span className="field__label">{copy.fontFamily}</span>
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
          <span className="field__label">{copy.accentColor}</span>
          <span className="color-control">
            <input
              type="color"
              value={data.theme.accent}
              aria-label={copy.accentColorAria}
              onChange={(event) => onAccentChange(event.target.value)}
            />
            <output>{data.theme.accent.toUpperCase()}</output>
          </span>
        </label>

        <label className="field field--wide">
          <span className="range-heading">
            <span className="field__label">{copy.baseFontSize}</span>
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
          <span className="range-labels"><span>{copy.moreSpace}</span><span>{copy.largerText}</span></span>
        </label>

        <div className="field field--wide">
          <span className="field__label">{copy.layoutSpacing}</span>
          <div className="density-options" role="group" aria-label={copy.layoutSpacing}>
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
          <strong>{copy.keepOnePage}</strong>
          <small>{copy.keepOnePageHint}</small>
        </span>
      </label>
    </section>
  );
}

function RepeaterSection({
  children,
  copy,
  title,
  titlePlaceholder,
  empty,
  button,
  onTitleChange,
  onAdd,
}: {
  children: React.ReactNode;
  copy: UiCopy;
  title: string;
  titlePlaceholder: string;
  empty: string;
  button: string;
  onTitleChange: (title: string) => void;
  onAdd: () => void;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="repeater-stack">
      <Field
        wide
        label={copy.sectionTitle}
        value={title}
        placeholder={titlePlaceholder}
        hint={copy.sectionTitleHint}
        onChange={(event) => onTitleChange(event.target.value)}
      />
      {!hasChildren && <EmptyState>{empty}</EmptyState>}
      {children}
      <button className="button button--add" type="button" onClick={onAdd}>
        <Plus size={16} /> {button}
      </button>
    </div>
  );
}

function CustomSectionsEditor({
  copy,
  language,
  sections,
  onChange,
}: {
  copy: UiCopy;
  language: UiLanguage;
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}) {
  return (
    <section className="custom-sections" aria-labelledby="custom-sections-heading">
      <header className="custom-sections__heading">
        <div>
          <strong id="custom-sections-heading">{copy.customSections}</strong>
          <p>{copy.customSectionsDescription}</p>
        </div>
      </header>

      <div className="custom-sections__list">
        {sections.map((section, index) => (
          <RepeaterCard
            key={index}
            language={language}
            title={section.title || `${copy.customSection} ${index + 1}`}
            index={index}
            total={sections.length}
            onMove={(direction) => onChange(swap(sections, index, direction))}
            onRemove={() => onChange(sections.filter((_, itemIndex) => itemIndex !== index))}
          >
            <CustomSectionFields
              copy={copy}
              section={section}
              onChange={(next) => onChange(sections.map((item, itemIndex) => itemIndex === index ? next : item))}
            />
          </RepeaterCard>
        ))}
      </div>

      <button
        className="button button--add"
        type="button"
        onClick={() => onChange([...sections, { title: "", items: [{ name: "", description: "" }] }])}
      >
        <Plus size={16} /> {copy.addCustomSection}
      </button>
    </section>
  );
}

function CustomSectionFields({
  copy,
  section,
  onChange,
}: {
  copy: UiCopy;
  section: CustomSection;
  onChange: (section: CustomSection) => void;
}) {
  return (
    <div className="form-grid">
      <Field
        wide
        label={copy.customSectionTitle}
        value={section.title}
        placeholder={copy.customSectionTitlePlaceholder}
        onChange={(event) => onChange({ ...section, title: event.target.value })}
      />

      {section.items.map((item, index) => (
        <div className="custom-section-item field--wide" key={index}>
          <header>
            <span className="field__label">{copy.customItem} {index + 1}</span>
            <button
              type="button"
              className="icon-button icon-button--danger"
              aria-label={`${copy.removeCustomItem} ${index + 1}`}
              onClick={() => onChange({ ...section, items: section.items.filter((_, itemIndex) => itemIndex !== index) })}
            >
              <Trash2 size={15} />
            </button>
          </header>
          <div className="custom-section-item__fields">
            <Field
              label={copy.customItemName}
              value={item.name}
              placeholder={copy.customItemNamePlaceholder}
              onChange={(event) => onChange({
                ...section,
                items: section.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: event.target.value } : entry),
              })}
            />
            <TextArea
              label={copy.description}
              rows={2}
              value={item.description}
              placeholder={copy.customItemDescriptionPlaceholder}
              onChange={(event) => onChange({
                ...section,
                items: section.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry),
              })}
            />
          </div>
        </div>
      ))}

      <button
        className="inline-add"
        type="button"
        onClick={() => onChange({ ...section, items: [...section.items, { name: "", description: "" }] })}
      >
        <Plus size={15} /> {copy.addCustomItem}
      </button>
    </div>
  );
}

function EducationFields({ copy, item, onChange }: { copy: UiCopy; item: Education; onChange: (item: Education) => void }) {
  return <div className="form-grid">
    <Field label={copy.institution} value={item.institution} placeholder={copy.universityName} onChange={(e) => onChange({ ...item, institution: e.target.value })} />
    <Field label={copy.degree} value={item.degree} placeholder={copy.degreePlaceholder} onChange={(e) => onChange({ ...item, degree: e.target.value })} />
    <Field label={copy.date} value={item.date} placeholder="2020 – 2024" onChange={(e) => onChange({ ...item, date: e.target.value })} />
    <Field label={copy.location} value={item.location} placeholder={copy.cityCountry} onChange={(e) => onChange({ ...item, location: e.target.value })} />
    <TextArea wide label={copy.detailsOptional} rows={2} value={item.details} placeholder={copy.educationDetailsPlaceholder} onChange={(e) => onChange({ ...item, details: e.target.value })} />
  </div>;
}

function ExperienceFields({ copy, language, item, onChange }: { copy: UiCopy; language: UiLanguage; item: Experience; onChange: (item: Experience) => void }) {
  return <div className="form-grid">
    <Field label={copy.role} value={item.role} placeholder={copy.softwareEngineer} onChange={(e) => onChange({ ...item, role: e.target.value })} />
    <Field label={copy.organization} value={item.organization} placeholder={copy.companyName} onChange={(e) => onChange({ ...item, organization: e.target.value })} />
    <Field label={copy.date} value={item.date} placeholder={copy.presentDatePlaceholder} onChange={(e) => onChange({ ...item, date: e.target.value })} />
    <Field label={copy.location} value={item.location} placeholder={copy.remote} onChange={(e) => onChange({ ...item, location: e.target.value })} />
    <StringList language={language} label={copy.achievementBullets} values={item.bullets} placeholder={copy.achievementPlaceholder} addLabel={copy.addBullet} onChange={(bullets) => onChange({ ...item, bullets })} />
  </div>;
}

function ProjectFields({ copy, language, item, onChange }: { copy: UiCopy; language: UiLanguage; item: Project; onChange: (item: Project) => void }) {
  return <div className="form-grid">
    <Field label={copy.projectOrAwardName} value={item.name} placeholder={copy.projectName} onChange={(e) => onChange({ ...item, name: e.target.value })} />
    <Field label={copy.date} value={item.date} placeholder="2024 – Present" onChange={(e) => onChange({ ...item, date: e.target.value })} />
    <Field wide label={copy.projectUrlOptional} type="url" value={item.url} placeholder="https://github.com/username/project" onChange={(e) => onChange({ ...item, url: e.target.value })} />
    <StringList language={language} label={copy.projectBullets} values={item.bullets} placeholder={copy.projectBulletPlaceholder} addLabel={copy.addBullet} onChange={(bullets) => onChange({ ...item, bullets })} />
  </div>;
}

function SkillFields({ copy, language, item, onChange }: { copy: UiCopy; language: UiLanguage; item: SkillGroup; onChange: (item: SkillGroup) => void }) {
  return <div className="form-grid">
    <Field wide label={copy.categoryName} value={item.category} placeholder={copy.categoryPlaceholder} onChange={(e) => onChange({ ...item, category: e.target.value })} />
    <StringList language={language} label={copy.skills} values={item.items} placeholder="TypeScript" addLabel={copy.addSkill} onChange={(items) => onChange({ ...item, items })} />
  </div>;
}

function AdditionalFields({ copy, item, onChange }: { copy: UiCopy; item: AdditionalItem; onChange: (item: AdditionalItem) => void }) {
  return <div className="form-grid">
    <Field wide label={copy.additionalName} value={item.name} placeholder={copy.additionalNamePlaceholder} onChange={(e) => onChange({ ...item, name: e.target.value })} />
    <TextArea wide label={copy.description} rows={3} value={item.description} placeholder={copy.additionalDescriptionPlaceholder} onChange={(e) => onChange({ ...item, description: e.target.value })} />
  </div>;
}
