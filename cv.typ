// ============================================================
//  ATS-friendly CV template
//  Edit resume.example.json, then compile with:
//  typst compile --font-path fonts cv.typ resume.pdf
// ============================================================

#let resume = json("resume.example.json")

#let accent = rgb(resume.theme.accent)
#let ink = rgb("#1c1c1c")
#let muted = rgb("#5f5a5b")
#let hairc = rgb("#e7dfe1")
#let layout = resume.at("layout", default: (
  fontFamily: "Inter",
  fontSize: 9.2,
  density: "standard",
  autoFit: true,
))
#let type-scale = layout.fontSize / 9.2
#let density-scale = if layout.density == "dense" {
  0.60
} else if layout.density == "compact" {
  0.78
} else {
  1.0
}
#let fs(value) = value * type-scale
#let gap(value) = value * type-scale * density-scale
#let page-margin = if layout.density == "dense" {
  (x: 1.1cm, top: 0.55cm, bottom: 0.45cm)
} else if layout.density == "compact" {
  (x: 1.25cm, top: 0.7cm, bottom: 0.5cm)
} else {
  (x: 1.4cm, top: 0.85cm, bottom: 0.6cm)
}

#set document(title: resume.name + " — CV", author: resume.name)
#set page(paper: "a4", margin: page-margin)
#set text(font: layout.fontFamily, size: fs(9.2pt), fill: ink, lang: resume.language)
#set par(justify: false, leading: 0.50em * density-scale)
#show link: it => text(fill: accent, it)
#set list(
  marker: text(fill: accent, size: fs(6.5pt), baseline: fs(-1.5pt))[●],
  indent: fs(1pt),
  body-indent: fs(6pt),
)

// --- helpers -------------------------------------------------
#let mono(body) = text(font: "JetBrains Mono", size: fs(7.7pt), body)
#let ic(name, h: fs(8.5pt), b: 16%) = {
  let svg = read("icons/" + name + ".svg").replace("#7E2A3B", resume.theme.accent)
  box(
    baseline: b,
    image(bytes(svg), format: "svg", height: h),
  )
}
#let meta(body) = text(
  style: "italic",
  fill: muted,
  size: fs(8.5pt),
  weight: 400,
  body,
)
#let dot = h(fs(3pt)) + text(fill: muted, size: fs(8.5pt))[·] + h(fs(3pt))
#let section-title(key, fallback) = resume.at("sectionTitles", default: (:)).at(key, default: fallback)

#let sec(icon, title) = {
  v(gap(5.2pt))
  block(below: gap(2pt))[
    #ic(icon, h: fs(9.5pt), b: 18%)
    #h(fs(4.5pt))
    #text(
      fill: accent,
      weight: 700,
      size: fs(9.6pt),
      tracking: 0.05em,
      upper(title),
    )
  ]
  line(length: 100%, stroke: fs(0.7pt) + accent.lighten(58%))
  v(gap(3.6pt))
}

#let dated-title(title, subtitle, date, location: "") = block(
  above: gap(4.5pt),
  below: gap(4.2pt),
)[
  #text(weight: 600, size: fs(10pt))[#title — #subtitle]
  #h(fs(5pt))
  #meta(if location == "" { "(" + date + ")" } else { "(" + date + " · " + location + ")" })
]

#let sep() = {
  v(gap(0.8pt))
  line(length: 100%, stroke: fs(0.4pt) + hairc)
  v(gap(1.2pt))
}

#let contact-row(items) = {
  let visible = items.filter(item => item.value != "")
  for (index, item) in visible.enumerate() {
    if index > 0 { dot }
    ic(item.icon)
    h(fs(2.2pt))
    if item.url == "" {
      item.value
    } else {
      link(item.url, item.value)
    }
  }
}

#let bullet-list(items) = {
  for item in items {
    [- #item]
  }
}

// ============================================================
//  HEADER
// ============================================================
#text(size: fs(20pt), weight: 700, tracking: -0.01em)[#resume.name]
#v(gap(-5pt))
#text(size: fs(11pt), weight: 600, fill: accent)[#resume.title]
#v(gap(1.5pt))
#text(size: fs(8.6pt))[
  #contact-row((
    (icon: "map-pin", value: resume.contact.location, url: ""),
    (icon: "mail", value: resume.contact.email, url: "mailto:" + resume.contact.email),
    (icon: "phone", value: resume.contact.phone, url: "tel:" + resume.contact.phone),
  ))
]
#v(gap(-1.5pt))
#text(size: fs(8.6pt))[
  #contact-row((
    (icon: "github", value: resume.contact.github, url: resume.contact.githubUrl),
    (icon: "linkedin", value: resume.contact.linkedin, url: resume.contact.linkedinUrl),
    (icon: "globe", value: resume.contact.website, url: resume.contact.websiteUrl),
  ))
]

// ============================================================
//  SUMMARY
// ============================================================
#if resume.summary != "" [
  #sec("user", section-title("summary", "Summary"))
  #resume.summary
]

// ============================================================
//  EDUCATION
// ============================================================
#if resume.education.len() > 0 [
  #sec("graduation-cap", section-title("education", "Education"))
  #for (index, item) in resume.education.enumerate() {
    block(above: gap(4pt), below: gap(3pt))[
      #text(weight: 600, size: fs(10pt))[#item.institution — #item.degree]
      #h(fs(5pt))
      #meta(if item.location == "" { "(" + item.date + ")" } else { "(" + item.date + " · " + item.location + ")" })
    ]
    if item.details != "" [#item.details]
    if index < resume.education.len() - 1 { sep() }
  }
]

// ============================================================
//  EXPERIENCE
// ============================================================
#if resume.experience.len() > 0 [
  #sec("briefcase", section-title("experience", "Experience"))
  #for (index, item) in resume.experience.enumerate() {
    dated-title(item.role, item.organization, item.date, location: item.location)
    bullet-list(item.bullets)
    if index < resume.experience.len() - 1 { sep() }
  }
]

// ============================================================
//  PROJECTS & AWARDS
// ============================================================
#if resume.projects.len() > 0 [
  #sec("trophy", section-title("projects", "Projects & Awards"))
  #for item in resume.projects {
    block(above: gap(5.5pt), below: gap(4pt))[
      #text(weight: 600, size: fs(9.8pt))[#item.name]
      #h(fs(5pt))
      #meta("(" + item.date + ")")
      #if item.url != "" [
        #h(fs(5pt))
        #link(item.url)[#mono[Project link ↗]]
      ]
    ]
    bullet-list(item.bullets)
  }
]

// ============================================================
//  SKILLS & LANGUAGES
// ============================================================
#if resume.skills.len() > 0 [
  #sec("wrench", section-title("skills", "Skills & Languages"))
  #for item in resume.skills {
    grid(
      columns: (fs(120pt), 1fr),
      column-gutter: fs(10pt),
      text(weight: 600, size: fs(8.9pt))[#item.category],
      item.items.join(" · "),
    )
    v(gap(4.8pt))
  }
]

// ============================================================
//  OPEN SOURCE & VOLUNTEER
// ============================================================
#if resume.additional.len() > 0 [
  #sec("git-branch", section-title("additional", "Open Source & Volunteer"))
  #for item in resume.additional {
    [- #text(weight: 600)[#item.name]#if item.description != "" [ — #item.description]]
  }
]
