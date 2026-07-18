import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { $typst } from "@myriaddreamin/typst.ts";
import { TypstSnippet } from "@myriaddreamin/typst.ts/contrib/snippet";

const root = new URL("../", import.meta.url);
const readBytes = async (relativePath) => new Uint8Array(await readFile(new URL(relativePath, root)));

const wasmUrl = import.meta.resolve("@myriaddreamin/typst-ts-web-compiler/wasm");
const wasm = new Uint8Array(await readFile(fileURLToPath(wasmUrl)));

const fontPaths = [
  "fonts/Inter-Regular.otf",
  "fonts/Inter-Italic.otf",
  "fonts/Inter-Medium.otf",
  "fonts/Inter-SemiBold.otf",
  "fonts/Inter-Bold.otf",
  "fonts/JetBrainsMono-Regular.ttf",
  "fonts/JetBrainsMono-Medium.ttf",
];

const iconNames = [
  "map-pin",
  "mail",
  "phone",
  "github",
  "linkedin",
  "globe",
  "user",
  "graduation-cap",
  "briefcase",
  "trophy",
  "wrench",
  "git-branch",
];

$typst.setCompilerInitOptions({ getModule: () => wasm });
$typst.use(
  TypstSnippet.disableDefaultFontAssets(),
  TypstSnippet.preloadFonts(await Promise.all(fontPaths.map(readBytes))),
);

await $typst.addSource("/cv.typ", await readFile(new URL("cv.typ", root), "utf8"));
await Promise.all(
  iconNames.map(async (name) => {
    await $typst.mapShadow(`/icons/${name}.svg`, await readBytes(`icons/${name}.svg`));
  }),
);

const pageCount = (pdf) => {
  const source = new TextDecoder("latin1").decode(pdf);
  const match = source.match(/\/Type\s*\/Pages\s*\/Count\s+(\d+)/);
  return match ? Number(match[1]) : 0;
};

const compile = async (data, label, expectedPages = 1) => {
  await $typst.mapShadow(
    "/resume.example.json",
    new TextEncoder().encode(JSON.stringify(data)),
  );
  const pdf = await $typst.pdf({ mainFilePath: "/cv.typ", root: "/" });
  const header = pdf ? new TextDecoder().decode(pdf.slice(0, 4)) : "";

  if (!pdf || header !== "%PDF" || pdf.byteLength < 10_000) {
    throw new Error(`${label} failed to produce a valid PDF.`);
  }
  if (pageCount(pdf) !== expectedPages) {
    throw new Error(`${label} produced ${pageCount(pdf)} pages instead of ${expectedPages}.`);
  }

  return pdf;
};

const example = JSON.parse(await readFile(new URL("resume.example.json", root), "utf8"));
const samplePdf = await compile(example, "Default template");

const styled = structuredClone(example);
styled.theme.accent = "#1F6F5C";
styled.layout.fontFamily = "JetBrains Mono";
styled.layout.fontSize = 8.7;
styled.layout.density = "compact";
styled.sectionTitles.additional = "Hobbies & Interests";
const styledPdf = await compile(styled, "Custom styling and section titles");

const legacy = structuredClone(example);
delete legacy.sectionTitles;
delete legacy.customSections;
await compile(legacy, "Legacy data without optional section fields");

const customSections = structuredClone(example);
customSections.additional = [];
customSections.customSections = [
  {
    title: "Certifications",
    items: [
      { name: "Professional Certification", description: "Issuing organization · 2025" },
    ],
  },
];
await compile(customSections, "Resume with a custom section");

const expanded = structuredClone(example);
expanded.experience.push({
  ...structuredClone(expanded.experience[1]),
  role: "Junior Software Engineer",
  organization: "Earlier Company",
  date: "Jan 2023 – May 2023",
});
expanded.experience.push({
  ...structuredClone(expanded.experience[1]),
  role: "Software Engineering Trainee",
  organization: "First Company",
  date: "Jun 2022 – Dec 2022",
});
expanded.projects.push(
  {
    ...structuredClone(expanded.projects[0]),
    name: "Second Project",
    date: "2023",
  },
  {
    ...structuredClone(expanded.projects[0]),
    name: "Third Project",
    date: "2022",
  },
  {
    ...structuredClone(expanded.projects[0]),
    name: "Fourth Project",
    date: "2021",
  },
  {
    ...structuredClone(expanded.projects[0]),
    name: "Fifth Project",
    date: "2020",
  },
  {
    ...structuredClone(expanded.projects[0]),
    name: "Sixth Project",
    date: "2019",
  },
);
expanded.skills.push(
  { category: "Cloud & DevOps", items: ["AWS", "Docker", "Kubernetes"] },
  { category: "Tools", items: ["Git", "GitHub Actions", "Linux"] },
);
const expandedStandard = structuredClone(expanded);
await compile(expandedStandard, "Expanded standard template", 2);

expanded.layout.density = "dense";
const expandedPdf = await compile(expanded, "Expanded one-page template");

const minimumSize = structuredClone(expanded);
minimumSize.layout.fontSize = 7.4;
await compile(minimumSize, "Readable minimum template");

if (process.argv.includes("--write-artifacts")) {
  const artifactDirectory = new URL("../tmp/pdfs/", import.meta.url);
  await mkdir(artifactDirectory, { recursive: true });
  await Promise.all([
    writeFile(new URL("verify-styled.pdf", artifactDirectory), styledPdf),
    writeFile(new URL("verify-expanded.pdf", artifactDirectory), expandedPdf),
  ]);
}

console.log(`Browser compiler verified with default, styled, and expanded one-page CVs (${Math.round(samplePdf.byteLength / 1024)} KB sample PDF).`);
