import { $typst } from "@myriaddreamin/typst.ts";
import { TypstSnippet } from "@myriaddreamin/typst.ts/contrib/snippet";
import compilerWasm from "@myriaddreamin/typst-ts-web-compiler/wasm?url";
import templateSource from "../../cv.typ?raw";
import type { LayoutDensity, ResumeData } from "../types";

const encoder = new TextEncoder();

const fontUrls = [
  new URL("../../fonts/Inter-Regular.otf", import.meta.url).href,
  new URL("../../fonts/Inter-Italic.otf", import.meta.url).href,
  new URL("../../fonts/Inter-Medium.otf", import.meta.url).href,
  new URL("../../fonts/Inter-SemiBold.otf", import.meta.url).href,
  new URL("../../fonts/Inter-Bold.otf", import.meta.url).href,
  new URL("../../fonts/JetBrainsMono-Regular.ttf", import.meta.url).href,
  new URL("../../fonts/JetBrainsMono-Medium.ttf", import.meta.url).href,
];

const iconUrls: Record<string, string> = {
  "map-pin": new URL("../../icons/map-pin.svg", import.meta.url).href,
  mail: new URL("../../icons/mail.svg", import.meta.url).href,
  phone: new URL("../../icons/phone.svg", import.meta.url).href,
  github: new URL("../../icons/github.svg", import.meta.url).href,
  linkedin: new URL("../../icons/linkedin.svg", import.meta.url).href,
  globe: new URL("../../icons/globe.svg", import.meta.url).href,
  user: new URL("../../icons/user.svg", import.meta.url).href,
  "graduation-cap": new URL("../../icons/graduation-cap.svg", import.meta.url).href,
  briefcase: new URL("../../icons/briefcase.svg", import.meta.url).href,
  trophy: new URL("../../icons/trophy.svg", import.meta.url).href,
  wrench: new URL("../../icons/wrench.svg", import.meta.url).href,
  "git-branch": new URL("../../icons/git-branch.svg", import.meta.url).href,
};

let initialization: Promise<void> | undefined;
let compileQueue = Promise.resolve<CompileOutput | undefined>(undefined);

export interface CompileOutput {
  pdf: Uint8Array<ArrayBufferLike>;
  pageCount: number;
  appliedFontSize: number;
  appliedDensity: LayoutDensity;
  autoFitted: boolean;
  fitFailed: boolean;
}

const fetchBytes = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load a CV asset (${response.status}).`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

const initializeCompiler = () => {
  if (initialization) return initialization;

  initialization = (async () => {
    $typst.setCompilerInitOptions({
      getModule: () => compilerWasm,
    });
    $typst.use(
      TypstSnippet.disableDefaultFontAssets(),
      TypstSnippet.preloadFonts(fontUrls),
    );

    await $typst.addSource("/cv.typ", templateSource);
    await Promise.all(
      Object.entries(iconUrls).map(async ([name, url]) => {
        await $typst.mapShadow(`/icons/${name}.svg`, await fetchBytes(url));
      }),
    );
  })();

  return initialization;
};

const readPageCount = (pdf: Uint8Array<ArrayBufferLike>) => {
  const source = new TextDecoder("latin1").decode(pdf);
  const match = source.match(/\/Type\s*\/Pages\s*\/Count\s+(\d+)/);
  return match ? Number(match[1]) : 1;
};

const compilePdf = async (data: ResumeData) => {
  await initializeCompiler();
  await $typst.mapShadow(
    "/resume.example.json",
    encoder.encode(JSON.stringify(data)),
  );

  const pdf = await $typst.pdf({
    mainFilePath: "/cv.typ",
    root: "/",
  });

  if (!pdf) {
    throw new Error("Typst could not generate the PDF. Check the form fields and try again.");
  }

  return {
    pdf,
    pageCount: readPageCount(pdf),
  };
};

const withLayout = (
  data: ResumeData,
  fontSize: number,
  density: LayoutDensity,
): ResumeData => ({
  ...data,
  layout: {
    ...data.layout,
    fontSize: Number(fontSize.toFixed(2)),
    density,
  },
});

const asOutput = (
  compiled: Awaited<ReturnType<typeof compilePdf>>,
  data: ResumeData,
  autoFitted = false,
  fitFailed = false,
): CompileOutput => ({
  pdf: compiled.pdf,
  pageCount: compiled.pageCount,
  appliedFontSize: data.layout.fontSize,
  appliedDensity: data.layout.density,
  autoFitted,
  fitFailed,
});

const compileOnce = async (data: ResumeData): Promise<CompileOutput> => {
  const selected = await compilePdf(data);
  if (!data.layout.autoFit || selected.pageCount <= 1) {
    return asOutput(selected, data);
  }

  const minimumSize = 7.4;
  const maximumSize = Math.max(minimumSize, Math.min(data.layout.fontSize, 9.2));
  const denseMaximumData = withLayout(data, maximumSize, "dense");
  const denseMaximum = await compilePdf(denseMaximumData);

  if (denseMaximum.pageCount <= 1) {
    return asOutput(denseMaximum, denseMaximumData, true);
  }

  const minimumData = withLayout(data, minimumSize, "dense");
  const minimum = await compilePdf(minimumData);
  if (minimum.pageCount > 1) {
    return asOutput(minimum, minimumData, true, true);
  }

  let low = minimumSize;
  let high = maximumSize;
  let bestData = minimumData;
  let best = minimum;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const middle = (low + high) / 2;
    const candidateData = withLayout(data, middle, "dense");
    const candidate = await compilePdf(candidateData);

    if (candidate.pageCount <= 1) {
      low = middle;
      bestData = candidateData;
      best = candidate;
    } else {
      high = middle;
    }
  }

  return asOutput(best, bestData, true);
};

export const compileResume = (data: ResumeData) => {
  const next = compileQueue.then(
    () => compileOnce(data),
    () => compileOnce(data),
  );
  compileQueue = next;
  return next;
};
