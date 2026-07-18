import { readFile } from "node:fs/promises";
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
await $typst.mapShadow("/resume.example.json", await readBytes("resume.example.json"));
await Promise.all(
  iconNames.map(async (name) => {
    await $typst.mapShadow(`/icons/${name}.svg`, await readBytes(`icons/${name}.svg`));
  }),
);

const pdf = await $typst.pdf({ mainFilePath: "/cv.typ", root: "/" });
const header = pdf ? new TextDecoder().decode(pdf.slice(0, 4)) : "";

if (!pdf || header !== "%PDF" || pdf.byteLength < 10_000) {
  throw new Error("Browser compiler verification failed to produce a valid PDF.");
}

console.log(`Browser compiler verified (${Math.round(pdf.byteLength / 1024)} KB PDF).`);
