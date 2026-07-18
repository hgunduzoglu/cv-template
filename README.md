# ATS-Friendly Typst CV

A public-ready, single-column CV template built with [Typst](https://typst.app/), plus a browser-based CV builder that previews and exports the same template as a PDF.

> Live demo: `https://cv-template-steel.vercel.app/`

[Türkçe dokümantasyon](README_TR.md)

## Features

- ATS-friendly single-column layout with standard section headings
- Data-driven template: edit JSON instead of layout code
- Dynamic education, experience, project, skill, language, and community sections
- Configurable font family, base font size, spacing density, and accent color
- Accent color automatically applies to headings, rules, bullets, links, and icons
- Optional one-page fitting with a readable 7.4 pt minimum
- Browser-based PDF generation powered by Typst WebAssembly
- Live preview and one-click PDF download
- Local browser persistence with no account, database, or server-side storage
- Bundled Inter and JetBrains Mono fonts for reproducible output
- Responsive interface ready for static deployment on Vercel

## Privacy

The web builder runs entirely in the browser. CV data is stored only in the current browser's local storage and is never uploaded by this project. Clearing browser storage removes the saved draft.

## Use the web builder locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The static output is written to `dist/`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Keep the detected Vite settings, or use:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

No environment variables, API keys, backend, or database are required.

## Use the Typst template directly

Install the [Typst CLI](https://github.com/typst/typst/releases), then edit `resume.example.json` and run:

```bash
typst compile --font-path fonts cv.typ resume.pdf
```

Homebrew users can install Typst with:

```bash
brew install typst
```

You can also upload `cv.typ`, `resume.example.json`, `fonts/`, and `icons/` to the [Typst web app](https://typst.app/).

## Customize your CV

All example values are intentionally generic placeholders. Replace the values in `resume.example.json`:

```json
{
  "name": "Your Name",
  "title": "Software Engineer",
  "contact": {
    "email": "you@example.com"
  }
}
```

The following collections accept any number of entries:

- `education`
- `experience`
- `projects`
- `skills`
- `additional`

Experience and project entries accept any number of `bullets`. Each skill group has a custom `category` and any number of `items`, so categories such as Programming, Backend, Design, Cloud, Tools, or Languages are fully configurable.

Change the CV accent color through `theme.accent`:

```json
{
  "theme": {
    "accent": "#7E2A3B"
  }
}
```

Typography and spacing are controlled through `layout`:

```json
{
  "layout": {
    "fontFamily": "Inter",
    "fontSize": 9.2,
    "density": "standard",
    "autoFit": true
  }
}
```

Bundled font choices are `Inter` and `JetBrains Mono`. Density can be `standard`, `compact`, or `dense`. When `autoFit` is enabled, the browser first preserves the selected style. If the document exceeds one page, it uses dense spacing and finds the largest font size that fits, without going below 7.4 pt. If the content still needs multiple pages at that limit, the builder shows a warning instead of making the CV unreadably small.

## Project structure

```text
.
├── cv.typ                 # Typst layout and rendering logic
├── resume.example.json    # Public placeholder CV data
├── fonts/                 # Bundled document fonts
├── icons/                 # CV section and contact icons
├── src/                   # React web builder
├── vercel.json            # Static Vercel configuration
└── README_TR.md            # Turkish documentation
```

## ATS notes

The template uses a single reading column and conventional headings such as Summary, Education, Experience, and Skills. Icons are decorative SVGs and do not replace essential text. Contact details and URLs remain real PDF text.

Reducing the font size can help with a slightly longer CV, but concise content is still the strongest ATS and readability choice. The one-page fitting option is a guardrail, not a guarantee for unlimited entries.

For an extra check, extract the generated PDF text:

```bash
pdftotext -layout resume.pdf -
```

Always test the final PDF with the specific application system you plan to use. No template can guarantee identical parsing across every ATS vendor.

## Credits

- [Typst](https://github.com/typst/typst)
- [typst.ts](https://github.com/Myriad-Dreamin/typst.ts) for browser-side compilation
- [Inter](https://github.com/rsms/inter) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) fonts
- [Lucide](https://lucide.dev/) icons

The bundled fonts are distributed under the SIL Open Font License 1.1. Their copyright notices and license text are included in [`fonts/LICENSES.md`](fonts/LICENSES.md).


## License

This project is available under the MIT License. See [LICENSE](LICENSE).
