import { $typst } from "@myriaddreamin/typst.ts";
import { TypstSnippet } from "@myriaddreamin/typst.ts/contrib/snippet";
import compilerWasm from "@myriaddreamin/typst-ts-web-compiler/wasm?url";
import templateSource from "../../cv.typ?raw";
import type { ResumeData } from "../types";

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
let compileQueue = Promise.resolve<Uint8Array | undefined>(undefined);

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

const compileOnce = async (data: ResumeData) => {
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

  return pdf;
};

export const compileResume = (data: ResumeData) => {
  const next = compileQueue.then(
    () => compileOnce(data),
    () => compileOnce(data),
  );
  compileQueue = next;
  return next;
};
