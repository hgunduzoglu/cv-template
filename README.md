# ATS-Friendly Typst CV

A single-column CV template built with [Typst](https://typst.app/), accompanied by a browser-based editor that generates a live preview and exports the same template as a PDF.

> [Open the live demo](https://cv-template-steel.vercel.app/)

[Türkçe dokümantasyon](README_TR.md)

## Features

- ATS-friendly single-column layout with customizable section headings
- Data-driven template: edit JSON instead of layout code
- Dynamic education, experience, project, skill, language, and community sections
- Configurable font family, base font size, spacing density, and accent color
- Accent color automatically applies to headings, rules, bullets, links, and icons
- Optional one-page fitting with a readable 7.4 pt minimum
- Browser-based PDF generation powered by Typst WebAssembly
- Live preview and one-click PDF download
- Bilingual English/Turkish editor with a persistent language preference
- Local browser persistence with no account, database, or server-side storage
- [Vercel Web Analytics](https://vercel.com/docs/analytics) integration for deployment-level usage insights
- Bundled Inter and JetBrains Mono fonts for reproducible output
- Responsive interface ready for static deployment on Vercel

## Privacy

CV content, generated documents, and saved drafts remain in the browser. Drafts are stored in local storage and can be removed by clearing the browser's site data. The hosted application includes Vercel Web Analytics, but the application does not attach CV form values or generated document content to analytics events.

## Run locally

[Create a fork](https://github.com/hgunduzoglu/cv-template/fork) on GitHub, then clone it locally. Node.js 20 or newer is required.

```bash
git clone https://github.com/<your-github-username>/cv-template.git
cd cv-template
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The static output is written to `dist/`.

## Deploy your own instance to Vercel

1. [Fork this repository](https://github.com/hgunduzoglu/cv-template/fork) to your GitHub account.
2. Import the fork into a new Vercel project.
3. Keep Vercel's detected Vite settings, or configure:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy the project.

No environment variables, API keys, backend, or database are required. Vercel Web Analytics support is already included in the application; follow Vercel's [Web Analytics quickstart](https://vercel.com/docs/analytics/quickstart) to enable it for the new project.

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
  "sectionTitles": {
    "projects": "Selected Work",
    "additional": "Hobbies & Interests"
  },
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
- `customSections`

Experience and project entries accept any number of `bullets`. Each skill group has a custom `category` and any number of `items`, so categories such as Programming, Backend, Design, Cloud, Tools, or Languages are fully configurable.

Every visible CV heading can be renamed through `sectionTitles`. The available keys are `summary`, `education`, `experience`, `projects`, `skills`, and `additional`. The browser editor exposes the same settings, so a section such as Open Source & Volunteer can become Hobbies & Interests without editing the Typst source.

Additional sections can be appended through `customSections`. Each section has its own title and any number of name-description items:

```json
{
  "customSections": [
    {
      "title": "Certifications",
      "items": [
        {
          "name": "Professional Certification",
          "description": "Issuing organization · 2025"
        }
      ]
    }
  ]
}
```

The EN/TR selector localizes the editor, untouched default section headings, and the default `language` value. Custom headings and user-entered content are preserved, and the fields can still be used for other Latin-script languages.

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

## Issues and contributions

Bug reports, feature requests, accessibility improvements, documentation corrections, and other constructive suggestions are welcome. Please [open a GitHub issue](https://github.com/hgunduzoglu/cv-template/issues/new) with a clear description, expected behavior, and reproduction steps where applicable.

Code contributions are also welcome. To propose a change:

1. Fork the repository and create a focused branch.
2. Implement the change without adding personal CV data to the public example.
3. Run `npm run check` and confirm that the generated PDF remains valid.
4. [Open a pull request](https://github.com/hgunduzoglu/cv-template/pulls) describing the motivation, implementation, and any visible behavior changes.

Keeping pull requests focused and reviewable makes them easier to discuss, test, and merge.

## License

This project is available under the MIT License. See [LICENSE](LICENSE).
