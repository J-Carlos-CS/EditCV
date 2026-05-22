# ✦ EditCV

> **Build professional Harvard-style CVs using a form or plain YAML.**
> No accounts, no servers, no limits — everything runs in your browser.

![Status](https://img.shields.io/badge/status-in%20development-yellow?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-61dafb?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Table of Contents

- [What is EditCV?](#what-is-editcv)
- [Features](#features)
- [Getting Started](#getting-started)
- [Interface Layout](#interface-layout)
- [Form Editor](#form-editor)
- [YAML Editor](#yaml-editor)
- [YAML Structure](#yaml-structure)
- [Automatic Entry Type Detection](#automatic-entry-type-detection)
- [Inline Markdown](#inline-markdown)
- [PDF Export](#pdf-export)
- [Automatic Pagination](#automatic-pagination)
- [Persistence](#persistence)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Design Decisions](#design-decisions)
- [Roadmap](#roadmap)

---

## What is EditCV?

EditCV is a web app that generates a **Harvard-style CV** — the standard used at MIT, Harvard, Stanford, and most top universities — from a form or a YAML file. Fill in your information and the app handles layout, typography, and pagination in **US Letter (8.5" × 11")** format.

The output is a PDF ready to send: no flashy colors, no photos, no columns — just well-organized content in Times New Roman.

---

## Features

| Feature | Description |
|---|---|
| 📋 **Form editor** | Visual UI with fields per entry type — no YAML required |
| 📝 **YAML editor** | Full Monaco editor with syntax highlighting and error detection |
| 🔀 **Mode toggle** | Switch between Form and YAML at any time — data stays in sync |
| 👁 **Live preview** | CV updates instantly on every change |
| 📄 **Harvard format** | Times New Roman, centered section titles with horizontal rules |
| ➕ **Custom sections** | Add any section with any name you want |
| ↕ **Reorder sections** | Move sections up/down with ↑↓ buttons — order is reflected in the PDF |
| ✎ **Rename sections** | Inline name editing directly in the section header |
| 💾 **Autosave** | Every change is saved to `localStorage` with a 600ms debounce |
| 📂 **Multiple CVs** | Create, rename, and delete CVs from the sidebar |
| ⬇ **PDF export** | One-click download in US Letter format, ready to send |
| 🔍 **Preview zoom** | Control the preview zoom level (25% – 200%) |
| 🌙 **Dark / Light mode** | Theme toggle in the navbar, persisted across sessions |
| 🔌 **100% offline** | No backend, no database, no tracking |

---

## Getting Started

### Requirements

- Node.js 18+
- npm 9+

### Install & run

```bash
# 1. Clone the repository
git clone https://github.com/your-user/editcv.git
cd editcv

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

---

## Interface Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✦ EditCV                                                    [ ☀ / ☾ ]  │  ← Fixed navbar
└──────────────────────────────────────────────────────────────────────────┘
┌───────────────┬──────────────────────────┬───────────────────────────────┐
│               │                          │                               │
│  + New CV     │  ┌──── Form │ YAML ────┐ │  Preview — US Letter    🔍±  │
│  ──────────── │  │                     │ │  ─────────────────────────── │
│  ● My CV      │  │  Personal Info      │ │  ┌───────────────────────┐   │
│    Work       │  │  Social Networks    │ │  │     MARIO MENDOZA      │   │
│    Academic   │  │  ▸ Education    3   │ │  │  Software Engineer     │   │
│               │  │  ▸ Experience   3   │ │  │  email · phone · web   │   │
│               │  │  ▸ Skills       4   │ │  ├──────── Education ─────│   │
│               │  │  ▸ Publications 2   │ │  │  University ...   2020 │   │
│               │  │                     │ │  ├────── Experience ──────│   │
│               │  │  + New Section      │ │  │  Company ...     2022– │   │
│               │  └─────────────────────┘ │  └───────────────────────┘   │
│  Sidebar      │  Editor (Form / YAML)    │  Preview (scrollable)         │
│  220px fixed  │  flex: 1                 │  flex: 1                      │
└───────────────┴──────────────────────────┴───────────────────────────────┘
```

- **Sidebar** (220px): CV list with create, rename, and delete buttons
- **Editor**: toggles between Form Editor and YAML Editor via a header switch
- **Preview**: letter-size page with zoom control, PDF export button, and its own scroll

---

## Form Editor

The Form Editor is the default mode. It provides a visual interface that builds the YAML behind the scenes — no code required.

```
┌─ Personal Info ─────────────────────────────────────────────┐
│  Full Name   [ Mario Mendoza                              ]  │
│  Headline    [ Software Engineer & ML Researcher          ]  │
│  Location    [ Santa Cruz, Bolivia ]  Email [ mario@... ]   │
│  Phone       [ +591 7 123 4567    ]  Website[ mario.dev  ]  │
└─────────────────────────────────────────────────────────────┘

┌─ Social Networks ───────────────────────────────────────────┐
│  [ LinkedIn        ] [ mario-mendoza              ]  [ × ]  │
│  [ GitHub          ] [ mmendoza-dev               ]  [ × ]  │
│  + Add Network                                              │
└─────────────────────────────────────────────────────────────┘

┌─ Sections ──────────────────────────────────────────────────┐
│  ▸ Education                    3   [ ↑ ][ ↓ ][ ✎ ][ × ]  │
│  ▾ Experience                   3   [ ↑ ][ ↓ ][ ✎ ][ × ]  │
│  │                                                          │
│  │  ┌── #1 ──────────────── [ ↑ ][ ↓ ][ × ] ───────────┐  │
│  │  │  Company   [ Jalasoft                            ] │  │
│  │  │  Position  [ Senior Software Engineer            ] │  │
│  │  │  Start     [ 2022-01 ]  End [ ──────── ] ☑ Present│  │
│  │  │  Location  [ Cochabamba, Bolivia (Remote)        ] │  │
│  │  │  Highlights                              + Add    │  │
│  │  │  [ Led migration to microservices…           ] [×]│  │
│  │  │  [ Mentored 6 junior engineers               ] [×]│  │
│  │  └───────────────────────────────────────────────────┘  │
│  │                                                          │
│  │  + Add Experience                                        │
│                                                             │
│  ▸ Skills                       4   [ ↑ ][ ↓ ][ ✎ ][ × ]  │
│  ▸ Selected Honors              4   [ ↑ ][ ↓ ][ ✎ ][ × ]  │
│                                                             │
│  ╔═══════════════════════════════╗                          │
│  ║  + New Section                ║                          │
│  ╚═══════════════════════════════╝                          │
└─────────────────────────────────────────────────────────────┘
```

### Available entry types

Each section has an entry type that determines which fields appear in the form:

| Type | Available fields |
|---|---|
| **Education** | Institution, Field of Study, Degree, Start/End date, Location, Highlights |
| **Experience** | Company, Position, Start/End date, Location, Summary, Highlights |
| **Project** | Name (markdown), Start/End date or single Date, Summary, Highlights |
| **Publication** | Title, Authors, Journal, DOI, URL, Date |
| **Skill** | Label, Details |
| **Bullet / Honor** | Bullet (free text) |

### Adding a new section

Click **+ New Section**. A modal appears where you type a name and pick an entry type:

```
┌─ New Section ──────────────────────────────┐
│  Section Name  [ Certifications          ] │
│                                            │
│  Entry Type                                │
│  ┌────────────┐  ┌────────────────────┐   │
│  │ Education  │  │ Experience         │   │
│  └────────────┘  └────────────────────┘   │
│  ┌────────────┐  ┌────────────────────┐   │
│  │ Projects   │  │ Publications       │   │
│  └────────────┘  └────────────────────┘   │
│  ┌────────────┐  ┌────────────────────┐   │
│  │ Skills     │  │ ● Bullets/Honors   │   │
│  └────────────┘  └────────────────────┘   │
│                                            │
│              [ Cancel ] [ Add Section ]    │
└────────────────────────────────────────────┘
```

The name is automatically converted to `snake_case` as the YAML key, and displayed as a formatted title everywhere in the UI and the CV:

| You type | YAML key | Displayed as |
|---|---|---|
| `Certifications` | `certifications` | **Certifications** |
| `Invited Talks` | `invited_talks` | **Invited Talks** |
| `Selected Honors` | `selected_honors` | **Selected Honors** |

### Managing and reordering sections

Each section header has four action buttons:

```
┌─ Education   3 ──────────────────── [ ↑ ][ ↓ ][ ✎ ][ × ] ─┐
```

| Button | Action |
|---|---|
| **↑** | Move section one position up (disabled on the first section) |
| **↓** | Move section one position down (disabled on the last section) |
| **✎** | Start inline rename — press Enter to confirm, Escape to cancel |
| **×** | Delete the section and all its entries |

The order of sections in the form is the order they appear in the CV and the PDF.

---

## YAML Editor

Click **YAML** in the header toggle to see and edit the full YAML that represents your CV.

```
┌─ YAML Editor ──────────────────────────── [ Form | YAML ] ──┐
│                                                              │
│  1  cv:                                                      │
│  2    name: "Mario Mendoza"                                  │
│  3    headline: Software Engineer & ML Researcher            │
│  4    location: Santa Cruz de la Sierra, Bolivia             │
│  5    email: mario@email.com                                 │
│  6    phone: +591 7 123 4567                                 │
│  7    website: https://mario.dev                             │
│  8    social_networks:                                       │
│  9      - network: LinkedIn                                  │
│ 10        username: mario-mendoza                            │
│ 11    sections:                                              │
│ 12      education:                                           │
│ 13        - institution: Universidad Autónoma...             │
│    ...                                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
│ ⚠ Syntax error on line 13: unexpected token                  │  ← only shown on error
└──────────────────────────────────────────────────────────────┘
```

The editor uses **Monaco** (the same engine as VS Code) with:
- YAML syntax highlighting
- Block folding
- Line numbers
- Real-time syntax error detection
- Theme that follows the app's dark/light mode

Any change in the YAML is immediately reflected in the form and in the preview.

---

## YAML Structure

The document must have a root `cv:` key. All fields are optional except `name`.

```yaml
cv:
  # ── Personal info ──────────────────────────────────────────
  name: "Your Full Name"
  headline: "Your professional title"
  location: "City, Country"
  email: "you@email.com"
  phone: "+1 234 567 890"
  website: "https://yoursite.com"

  # ── Social networks ────────────────────────────────────────
  social_networks:
    - network: LinkedIn
      username: your-username
    - network: GitHub
      username: your-username

  # ── Sections ───────────────────────────────────────────────
  sections:

    education:
      - institution: "University Name"
        area: "Field of Study"
        degree: "PhD / MSc / BS / BA"
        start_date: 2018-09           # format: YYYY-MM
        end_date: 2023-05
        location: "City, Country"
        highlights:
          - "Thesis, honors, GPA, etc."

    experience:
      - company: "Company Name"
        position: "Your Job Title"
        start_date: 2022-01
        end_date: present             # use "present" for current jobs
        location: "City, Country (Remote)"
        summary: "Optional prose description of the role."
        highlights:
          - "Achievement with **concrete metrics**"
          - "Another key responsibility"

    projects:
      - name: "[Project Name](https://link.com)"   # markdown links work
        start_date: 2023-01
        end_date: present
        summary: "Short project description"
        highlights:
          - "Technical detail or achievement"

      - name: "Project with a single date"
        date: '2022'                  # alternative to start_date/end_date
        summary: "Description"
        highlights:
          - "Achievement"

    publications:
      - title: "Paper Title"
        authors:
          - "*Your Name*"             # asterisks = italic (marks lead author)
          - "Co-author One"
          - "Co-author Two"
        journal: "NeurIPS 2023"
        date: 2023-07
        doi: 10.1234/example.5678
        url: https://paper-url.com

    skills:
      - label: "Languages"
        details: "Python, JavaScript, Go, SQL"
      - label: "Infrastructure"
        details: "Docker, Kubernetes, AWS, Terraform"

    # Simple bullets — for honors, awards, talks, patents, etc.
    selected_honors:
      - bullet: "National Innovation Award (2023)"
      - bullet: "Exchange Scholarship — University of Chile (2019)"

    # You can create any section with any name:
    certifications:
      - bullet: "AWS Certified Solutions Architect (2023)"
      - bullet: "Google Cloud Professional Data Engineer (2022)"

    invited_talks:
      - bullet: "Keynote — LatamConf 2023, Bogotá"
      - bullet: "NLP Workshop — UAGRM 2022"
```

---

## Automatic Entry Type Detection

The renderer detects which component to use based on the **fields present** in each entry, not on the section name. This means you can name your sections anything you want.

```
Has "institution"?                           → EntryEducation
Has "company"?                               → EntryExperience
Has "title" AND "authors"?                   → EntryPublication
Has "name" AND ("start_date" OR "date" OR "highlights")? → EntryProject
Has "label" AND "details"?                   → EntrySkill
Has "bullet"?                                → EntryGeneric (bullet)
Has "reversed_number" or "number"?           → EntryGeneric (numbered)
Is a plain string?                           → EntryGeneric (free text)
```

**Example:** you can name a section `jobs` instead of `experience` and it will work exactly the same, because the entries inside have the `company` field.

| Fields present | Detected type | Component used |
|---|---|---|
| `institution` | Education | `EntryEducation` |
| `company` | Experience | `EntryExperience` |
| `title` + `authors` | Publication | `EntryPublication` |
| `name` + `start_date`/`date`/`highlights` | Project | `EntryProject` |
| `label` + `details` | Skill | `EntrySkill` |
| `bullet` | Simple bullet | `EntryGeneric` |
| `reversed_number` / `number` | Numbered item | `EntryGeneric` |
| Plain string | Free text | `EntryGeneric` |

---

## Inline Markdown

Any text field supports basic inline markdown:

| Syntax | Output |
|---|---|
| `**text**` | **bold** |
| `*text*` | *italic* |
| `[text](url)` | clickable link |

Real examples:

```yaml
highlights:
  - "Reduced latency by **73%** compared to the previous baseline"
  - "Paper published at [NeurIPS 2023](https://neurips.cc)"
  - "**Stack:** React, Node.js, PostgreSQL, Redis"

name: "[BoliviaNLP](https://github.com/mmendoza/bolivianlp)"

authors:
  - "*Mario Mendoza*"    # asterisks render as italic in the CV
  - "Ana Quispe"
```

---

## PDF Export

Click **⬇ Download PDF** in the preview toolbar.

### Export pipeline

```
exportToPDF(cvData)
      │
      ├─ Step 1: Measure heights
      │    Mount the full CV in a hidden off-screen div (left: -9999px)
      │    Measure each section's height with getBoundingClientRect()
      │
      ├─ Step 2: Paginate
      │    Apply the same algorithm as the live preview
      │    Distribute sections across pages with 992px of usable content each
      │
      └─ Step 3: Capture and build PDF
           For each page:
             Mount page content in a 816×1056px hidden div
             Capture with html2canvas at 3× scale → ~2448×3168px
             Add as JPEG (quality 0.92) to the PDF document
           Save as {cv-name}.pdf
```

### PDF specs

| Parameter | Value |
|---|---|
| Page size | US Letter (8.5" × 11" / 612pt × 792pt) |
| Capture resolution | 3× (high resolution) |
| Image format | JPEG, quality 0.92 |
| Background | White (ignores the app's dark theme) |
| Typeface | Times New Roman, 10pt |
| Filename | `{cv-name}.pdf` |

> The button is disabled if there are YAML syntax errors.

---

## Automatic Pagination

Both the live preview and the PDF export use the same pagination algorithm to guarantee they are always identical:

```
Available height per page = 1056px − 32px (top pad) − 32px (bottom pad) = 992px

For each content block (header, section):
  If accumulated_height + block_height > 992px:
    → Start a new page
  Add block to current page
  accumulated_height += block_height
```

This prevents a section from being cut in half across two pages. If a single section is taller than a full page, it occupies that page entirely.

In the preview, a page break is shown as a dark strip between two white sheets:

```
┌─────────────────┐
│  ...content     │  ← Page 1
│  ...            │
└─────────────────┘
  ░░░░░░░░░░░░░░░    ← Visual separator (not in the PDF)
┌─────────────────┐
│  ...continues   │  ← Page 2
└─────────────────┘
```

---

## Persistence

All data is saved automatically to the browser's `localStorage`. No manual action needed.

| Key | Type | Contents |
|---|---|---|
| `editcv_cvs` | JSON array | All CVs: `{ id, name, yaml, updatedAt }` |
| `editcv_active` | string | ID of the currently selected CV |
| `editcv_theme` | string | `"dark"` or `"light"` |

Autosave uses a **600ms debounce** — it waits 600ms after the last change before writing to storage, to avoid flooding it on every keystroke.

> Data persists across browser restarts. It is only cleared if you manually wipe `localStorage` or use private/incognito mode.

---

## Project Structure

```
editcv/
├── index.html
├── vite.config.js
├── package.json
│
└── src/
    ├── main.jsx                    # React entry point
    ├── App.jsx                     # Root component — global state and layout
    │
    ├── context/
    │   └── ThemeContext.jsx         # Dark/light mode via React Context + localStorage
    │
    ├── styles/
    │   └── global.css               # CSS variables, reset, layout, CV page styles
    │
    ├── utils/
    │   ├── yamlParser.js            # js-yaml wrapper + entry type detection logic
    │   ├── storage.js               # localStorage CRUD + default YAML template
    │   ├── pdfExport.jsx            # Export pipeline: measure → paginate → capture → PDF
    │   └── markdown.js              # Regex-based inline markdown renderer
    │
    └── components/
        │
        ├── Navbar/
        │   └── Navbar.jsx           # Top bar with theme toggle
        │
        ├── Sidebar/
        │   └── Sidebar.jsx          # CV list with create / rename / delete
        │
        ├── Editor/
        │   ├── Editor.jsx           # Container with Form/YAML toggle and mode state
        │   ├── FormEditor.jsx       # Full form UI: personal info, networks, sections
        │   └── FormEditor.css       # Form styles (uses app CSS variables for theming)
        │
        └── CVPreview/
            ├── CVPreview.jsx        # Paginator + preview renderer
            ├── CVSection.jsx        # Section title + entry type router
            ├── MD.jsx               # Component for rendering inline markdown
            │
            └── sections/
                ├── CVHeader.jsx         # Name, headline, contact info, networks
                ├── EntryEducation.jsx   # institution · degree · highlights
                ├── EntryExperience.jsx  # company · position · highlights
                ├── EntryProject.jsx     # name · summary · highlights
                ├── EntryPublication.jsx # title · authors · journal · doi
                ├── EntrySkill.jsx       # label: details
                └── EntryGeneric.jsx     # bullet / numbered / free text
```

---

## Data Flow

YAML is the single source of truth. Both the form and the Monaco editor read from and write back to the same `yamlText` state in `App.jsx`.

```
                          App.jsx
                             │
              ┌──────────────┴──────────────┐
              │                             │
         yamlText (string)            parsedCV (object)
              │                             │
    ┌─────────┴──────────┐                  │
    │                    │                  ▼
 onChange             onChange         CVPreview.jsx
    │                    │                  │
    ▼                    ▼             ┌────┴────┐
FormEditor.jsx    MonacoEditor    CVHeader   CVSection × N
    │                                            │
    │  toYaml(data)                         ┌───┴────────────────┐
    │  → serializes to YAML string          │  detectEntryType() │
    │                                       └───────────────────┬┘
    └──────────────────────────────────────────────────────────►│
                                                                 ▼
                                              EntryEducation / EntryExperience /
                                              EntryProject / EntryPublication /
                                              EntrySkill / EntryGeneric
```

### Form ↔ YAML sync

To avoid infinite update loops when the form triggers a YAML change:

```
User edits a field in the Form
        │
        ▼
update(newData)            updates Form's internal state
        │
        ▼
toYaml(newData)            serializes with js-yaml
        │
        ▼
onYamlChange(yamlStr)      propagates to App.jsx via setYamlText
        │
        ▼
parseCV(yamlText)          useEffect in App.jsx → produces parsedCV
        │
        ▼
setParsedCV(data)          passed as prop to both Form and Preview
        │
    ┌───┴────────────────┐
    │                    │
CVPreview               FormEditor
re-renders              skipSync = true → ignores the next cvData update
                        (prevents the form from resetting while the user types)
```

### State lifecycle

```
Initial load
      │
      ▼
loadCVs() from localStorage
      │
      ▼
setYamlText(cv.yaml)     → parseCV() → setParsedCV()
                                             │
                                             ▼
                                        CVPreview renders

Every user change
      │
      ▼
setYamlText(newValue)
      │
      ├─ parseCV()  → setParsedCV()  → CVPreview updates (immediate)
      │
      └─ debounce 600ms → saveCV() → localStorage
```

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 18 | UI framework and state management with hooks |
| [Vite](https://vitejs.dev) | 5 | Dev server with HMR and production bundler |
| [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) | 4 | Code editor with YAML syntax highlighting |
| [js-yaml](https://github.com/nodeca/js-yaml) | 4 | YAML parsing and serialization in the browser |
| [html2canvas](https://html2canvas.hertzen.com) | 1.4 | Renders the DOM as a canvas image for the PDF |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5 | Assembles canvas frames into a PDF file |

No backend. No database. No authentication. No runtime network dependencies.

---

## Design Decisions

**Why both a form and YAML?**
The form removes friction for non-technical users or when you just want to fill things in quickly. YAML is essential for power users who want to copy/paste from another CV, keep it in a git repo, or use advanced features like inline markdown. Both modes write the exact same data — there is no duplication.

**Why YAML as the internal format?**
It's more readable than JSON and easier to maintain by hand than XML. An engineer can store their CV in a git repo like any other config file, submit PRs with their updates, and get clean diffs.

**Why Harvard format?**
It's the most widely recognized standard for academic and technical CVs internationally. No colors, no photos, no columns — just well-organized content. It works across industries and cultures.

**Why localStorage instead of a backend?**
Zero onboarding friction. No accounts, no API keys, no latency. For a personal CV, localStorage is more than enough. If the user wants a backup, they can copy the YAML and save it as a file.

**Why detect entry type by fields instead of section name?**
Because section names are free-form — someone might write `jobs` instead of `experience`. Field-based detection makes the system robust to naming variations and supports sections in any language.

**Why use the same pagination algorithm in the preview and the PDF?**
To guarantee that what you see on screen is exactly what gets exported. If the preview shows 2 pages, the PDF has 2 pages with the same break point.

---

## Roadmap

- [ ] Drag-to-resize between editor and preview
- [ ] Multiple templates (beyond Harvard)
- [ ] Export YAML as a `.yaml` file
- [ ] Import YAML from a `.yaml` file
- [ ] `Ctrl+S` shortcut to force manual save
- [ ] Page numbers in the PDF
- [ ] Optional profile photo support
- [ ] Diff view when switching between CVs

---

## License

MIT — free for personal and commercial use.
