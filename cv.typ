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

#set document(title: resume.name + " — CV", author: resume.name)
#set page(paper: "a4", margin: (x: 1.4cm, top: 0.85cm, bottom: 0.6cm))
#set text(font: "Inter", size: 9.2pt, fill: ink, lang: resume.language)
#set par(justify: false, leading: 0.50em)
#show link: it => text(fill: accent, it)
#set list(
  marker: text(fill: accent, size: 6.5pt, baseline: -1.5pt)[●],
  indent: 1pt,
  body-indent: 6pt,
)

// --- helpers -------------------------------------------------
#let mono(body) = text(font: "JetBrains Mono", size: 7.7pt, body)
#let ic(name, h: 8.5pt, b: 16%) = box(
  baseline: b,
  image("icons/" + name + ".svg", height: h),
)
#let meta(body) = text(
  style: "italic",
  fill: muted,
  size: 8.5pt,
  weight: 400,
  body,
)
#let dot = h(3pt) + text(fill: muted, size: 8.5pt)[·] + h(3pt)

#let sec(icon, title) = {
  v(5.2pt)
  block(below: 2pt)[
    #ic(icon, h: 9.5pt, b: 18%)
    #h(4.5pt)
    #text(
      fill: accent,
      weight: 700,
      size: 9.6pt,
      tracking: 0.05em,
      upper(title),
    )
  ]
  line(length: 100%, stroke: 0.7pt + accent.lighten(58%))
  v(3.6pt)
}

#let dated-title(title, subtitle, date, location: "") = block(
  above: 4.5pt,
  below: 4.2pt,
)[
  #text(weight: 600, size: 10pt)[#title — #subtitle]
  #h(5pt)
  #meta(if location == "" { "(" + date + ")" } else { "(" + date + " · " + location + ")" })
]

#let sep() = {
  v(0.8pt)
  line(length: 100%, stroke: 0.4pt + hairc)
  v(1.2pt)
}

#let contact-row(items) = {
  let visible = items.filter(item => item.value != "")
  for (index, item) in visible.enumerate() {
    if index > 0 { dot }
    ic(item.icon)
    h(2.2pt)
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
#text(size: 20pt, weight: 700, tracking: -0.01em)[#resume.name]
#v(-5pt)
#text(size: 11pt, weight: 600, fill: accent)[#resume.title]
#v(1.5pt)
#text(size: 8.6pt)[
  #contact-row((
    (icon: "map-pin", value: resume.contact.location, url: ""),
    (icon: "mail", value: resume.contact.email, url: "mailto:" + resume.contact.email),
    (icon: "phone", value: resume.contact.phone, url: "tel:" + resume.contact.phone),
  ))
]
#v(-1.5pt)
#text(size: 8.6pt)[
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
  #sec("user", "Summary")
  #resume.summary
]

// ============================================================
//  EDUCATION
// ============================================================
#if resume.education.len() > 0 [
  #sec("graduation-cap", "Education")
  #for (index, item) in resume.education.enumerate() {
    block(above: 4pt, below: 3pt)[
      #text(weight: 600, size: 10pt)[#item.institution — #item.degree]
      #h(5pt)
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
  #sec("briefcase", "Experience")
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
  #sec("trophy", "Projects & Awards")
  #for item in resume.projects {
    block(above: 5.5pt, below: 4pt)[
      #text(weight: 600, size: 9.8pt)[#item.name]
      #h(5pt)
      #meta("(" + item.date + ")")
      #if item.url != "" [
        #h(5pt)
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
  #sec("wrench", "Skills & Languages")
  #for item in resume.skills {
    grid(
      columns: (120pt, 1fr),
      column-gutter: 10pt,
      text(weight: 600, size: 8.9pt)[#item.category],
      item.items.join(" · "),
    )
    v(4.8pt)
  }
]

// ============================================================
//  OPEN SOURCE & VOLUNTEER
// ============================================================
#if resume.additional.len() > 0 [
  #sec("git-branch", "Open Source & Volunteer")
  #for item in resume.additional {
    [- #text(weight: 600)[#item.name]#if item.description != "" [ — #item.description]]
  }
]
