# EditCV — Technical Architecture Guide

> This document explains **how the application works internally**, from the moment it boots to the moment a PDF is downloaded. Written so a junior developer can follow the entire flow without prior context.

---

## Table of Contents

1. [Mental model — what this app actually is](#1-mental-model--what-this-app-actually-is)
2. [Tech stack and why each piece exists](#2-tech-stack-and-why-each-piece-exists)
3. [Entry point — where the app starts](#3-entry-point--where-the-app-starts)
4. [Context providers — global state the whole app can read](#4-context-providers--global-state-the-whole-app-can-read)
5. [App.jsx — the brain of the application](#5-appjsx--the-brain-of-the-application)
6. [localStorage — how data survives a page refresh](#6-localstorage--how-data-survives-a-page-refresh)
7. [YAML as the single source of truth](#7-yaml-as-the-single-source-of-truth)
8. [The Editor — two ways to edit the same data](#8-the-editor--two-ways-to-edit-the-same-data)
9. [The Form Editor — how form fields become YAML](#9-the-form-editor--how-form-fields-become-yaml)
10. [The CV Preview — how YAML becomes a page](#10-the-cv-preview--how-yaml-becomes-a-page)
11. [Entry type detection — how the renderer knows what to show](#11-entry-type-detection--how-the-renderer-knows-what-to-show)
12. [Pagination — fitting content across multiple pages](#12-pagination--fitting-content-across-multiple-pages)
13. [Inline markdown rendering](#13-inline-markdown-rendering)
14. [Templates — changing the visual style](#14-templates--changing-the-visual-style)
15. [PDF export — the full pipeline](#15-pdf-export--the-full-pipeline)
16. [Complete data flow diagram](#16-complete-data-flow-diagram)
17. [File-by-file reference](#17-file-by-file-reference)
18. [Gotchas and non-obvious decisions](#18-gotchas-and-non-obvious-decisions)

---

## 1. Mental model — what this app actually is

Before looking at any code, it helps to have a clear mental model of what EditCV is:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   User types something  →  YAML string updates  →  CV renders   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**The entire app is a YAML-to-CV renderer.** There is one central piece of state — a string of YAML text — and everything else reacts to it:

- The **Form editor** is a friendly UI that reads the YAML and writes back to it.
- The **Monaco editor** shows the raw YAML string and lets you edit it directly.
- The **Preview** parses the YAML and renders the visual CV.
- The **PDF export** takes the same rendered CV and captures it as images.

There is no server. There is no database. There are no API calls. The only persistence is the browser's `localStorage`.

---

## 2. Tech stack and why each piece exists

| Library | What it does in this project |
|---|---|
| **React 18** | Manages all UI state and re-renders components when data changes |
| **Vite 5** | Bundles and serves the app during development (super fast HMR) |
| **js-yaml** | Converts between YAML string ↔ JavaScript object |
| **@monaco-editor/react** | Embeds the VS Code editor in the browser for the YAML tab |
| **html2canvas** | Takes a screenshot of a DOM node and returns a canvas bitmap |
| **jsPDF** | Creates a PDF file and embeds images (the canvas bitmaps) into it |

No CSS framework (Tailwind, Bootstrap, etc.) — the app uses plain CSS with custom properties for theming.

---

## 3. Entry point — where the app starts

```
src/main.jsx
```

This is the very first file that runs. It does three things:

```jsx
// 1. Import global CSS (variables, reset, layout)
import './styles/global.css'

// 2. Import template-specific CSS (harvard, classic, modern)
import './styles/cv-harvard.css'
import './styles/cv-classic.css'
import './styles/cv-modern.css'

// 3. Mount the app inside <div id="root"> in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Why import all three template CSS files here?** Because CSS classes from all templates need to be available at any time — the user can switch templates instantly without reloading.

---

## 4. Context providers — global state the whole app can read

React Context is a way to share data between components without passing props down every level. This app has two contexts:

### ThemeContext (`src/context/ThemeContext.jsx`)

Manages dark/light mode. Stores the preference in `localStorage` and writes a `data-theme` attribute on the `<html>` element, which CSS uses to switch color variables.

```jsx
// Any component can call this to get the current theme and toggle it
const { theme, toggle } = useTheme()
```

When the user clicks the theme button:
1. `toggle()` is called
2. State flips between `'dark'` and `'light'`
3. `document.documentElement.setAttribute('data-theme', newTheme)` runs
4. Every CSS variable that references `[data-theme="dark"]` instantly applies

### TemplateContext (`src/context/TemplateContext.jsx`)

Manages the active CV template (Harvard, Classic, Modern). Any component that needs to know the current template — like entry components that format dates — reads from this context.

```jsx
const { template, setTemplate } = useTemplate()
```

There are **two versions** of this provider:
- `TemplateProvider` — the normal one used in the live app, with state and `setTemplate`
- `TemplateStaticProvider` — a read-only version used during PDF export, where the template must be locked and not changeable

### How providers wrap the app

In `App.jsx`, the component tree looks like this:

```jsx
export default function App() {
  return (
    <ThemeProvider>
      <TemplateProvider>
        <AppInner />
      </TemplateProvider>
    </ThemeProvider>
  )
}
```

`AppInner` is the real app shell. It's separated so that it can consume both contexts via hooks.

---

## 5. App.jsx — the brain of the application

`AppInner` in `src/App.jsx` is where all the top-level state lives. Understanding this file means understanding the whole app.

### State variables

```jsx
const [cvs, setCVs]             // Array of all CV objects loaded from localStorage
const [activeCVId, setActiveCVId] // ID of the CV currently being edited
const [yamlText, setYamlText]   // THE YAML STRING — single source of truth
const [parsedCV, setParsedCV]   // Parsed JavaScript object from yamlText
const [parseError, setParseError] // Error message if YAML is invalid
const [exporting, setExporting] // True while PDF is being generated
const [zoom, setZoom]           // Preview zoom level (25–200%)
```

### The three `useEffect` hooks — the app's lifecycle

**Effect 1: Bootstrap (runs once on mount)**
```
Load CVs from localStorage
  └─ If none exist → create a default CV
     Set active CV
     Set yamlText to active CV's stored YAML
```

**Effect 2: Live parse (runs every time `yamlText` changes)**
```
yamlText changes
  └─ parseCV(yamlText)
       └─ If valid   → setParsedCV(data)   → preview updates
          If invalid → setParseError(msg)  → error badge shows
```

**Effect 3: Auto-save (runs every time `yamlText` changes, debounced)**
```
yamlText changes
  └─ Clear previous timer
     Start 600ms timer
       └─ On timer fire → saveCV({ ...activeCV, yaml: yamlText })
```

The 600ms debounce means the app waits until you stop typing before writing to `localStorage`. Without it, every single keystroke would trigger a write.

**Effect 4: Responsive zoom (runs once on mount, driven by ResizeObserver)**
```
ResizeObserver watches the preview pane
  └─ On resize → calculate zoom = paneWidth / 816 * 100
     Clamp to 25–200% range
     setZoom(calculated)
```

`816px` is the width of a US Letter page at 96 DPI. The formula makes the page exactly fit the available pane width by default.

---

## 6. localStorage — how data survives a page refresh

All persistence is handled in `src/utils/storage.js`.

### Data schema

Three keys are stored in `localStorage`:

```
editcv_cvs     → JSON string of an array of CV objects
editcv_active  → string ID of the currently open CV
editcv_theme   → "dark" or "light"
```

Each CV object has this shape:

```js
{
  id: "1716571234567",    // timestamp as string — used as unique ID
  name: "My CV",
  yaml: "cv:\n  name: ...", // the full YAML content
  updatedAt: "2024-05-24T10:00:00.000Z"
}
```

### CRUD functions

```js
loadCVs()         // returns the full array, or [] if nothing stored
saveCV(cv)        // upserts (updates if id exists, inserts if not)
deleteCV(id)      // filters out the CV with that id
createCV(name)    // returns a new CV object with default YAML template
getActiveId()     // returns the stored active CV id
setActiveId(id)   // stores the active CV id
```

---

## 7. YAML as the single source of truth

This is the most important architectural decision in the app.

```
                     ┌─────────────────────────────────┐
                     │         yamlText (string)        │
                     │  (state in App.jsx)              │
                     └──────────────┬──────────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
     FormEditor reads         MonacoEditor            parseCV()
     parsedCV (object)        shows raw string        produces parsedCV
     and writes back          and writes back         → CVPreview renders
     via toYaml()             directly
```

Both editors write to `yamlText`. Neither one owns the data — they are both just views into the same string. This means:

- If you type in the Form, the Monaco editor updates.
- If you type in Monaco, the Form updates.
- The preview always reflects the latest valid YAML.

### How the form avoids an infinite loop

When the Form changes data, it:
1. Updates its internal `formData` state
2. Serializes `formData` to a YAML string
3. Calls `onYamlChange(newYaml)` → propagates up to `App.jsx`
4. `App.jsx` calls `parseCV(newYaml)` → produces new `parsedCV`
5. Passes `parsedCV` back down to `FormEditor` as a prop

But step 5 would reset the form's internal state! To prevent this, `FormEditor` uses a `skipNextSyncRef`:

```jsx
// When the form triggers a YAML change, set a flag
skipNextSyncRef.current = true
onYamlChange(newYaml)

// When new cvData arrives as a prop, check the flag
useEffect(() => {
  if (skipNextSyncRef.current) {
    skipNextSyncRef.current = false
    return  // ← skip, this update came from us
  }
  setFormData(cvData)  // ← this update came from elsewhere (Monaco or load)
}, [cvData])
```

This is the "skip sync" pattern — common when two-way binding would cause cycles.

---

## 8. The Editor — two ways to edit the same data

`src/components/Editor/Editor.jsx` is a container that:
1. Holds a `mode` state: `'form'` or `'yaml'`
2. Shows a toggle button to switch between them
3. Renders either `FormEditor` or the Monaco editor based on mode
4. Shows an error badge if `parseError` is not null

```
┌────────────────────────────────────┐
│  [ Form │ YAML ]   ⚠ error badge  │
├────────────────────────────────────┤
│                                    │
│   <FormEditor />   or              │
│   <MonacoEditor />                 │
│                                    │
└────────────────────────────────────┘
```

The Monaco editor is configured with:
- Language: `yaml`
- Font: Cascadia Code with ligatures
- Theme: auto-synced with the app's dark/light mode
- Features: syntax highlighting, line numbers, block folding, bracket colorization

---

## 9. The Form Editor — how form fields become YAML

`src/components/Editor/FormEditor.jsx` is the most complex component in the app. Here is its full internal structure:

### Internal state

```jsx
const [formData, setFormData]   // The CV data as a JavaScript object
const [showAddSection, setShowAddSection]  // Controls the modal
const skipNextSyncRef            // Prevents sync loop (see section 7)
```

### Component hierarchy

```
FormEditor
├── Personal Info fields (name, headline, location, email, phone, website)
│     Each one is a <TextField> or <TextAreaField> primitive
│
├── Social Networks
│     List of {network, username} pairs
│     Each row: <TextField> + <TextField> + delete button
│     "+ Add Network" appends a blank row
│
└── Sections (mapped from formData.sections)
      Each section is a <SectionPanel>
      │
      ├── Header: section name, entry count, [↑][↓][✎][×] buttons
      │
      └── Entries (mapped from section.entries)
            Each entry is rendered by one of:
            ├── <EducationEntryForm>
            ├── <ExperienceEntryForm>
            ├── <ProjectEntryForm>
            ├── <PublicationEntryForm>
            ├── <SkillEntryForm>
            └── <HonorEntryForm>
```

### Reusable form primitives

These small components are defined inside `FormEditor.jsx` and are the building blocks of all the form fields:

```
TextField        → <input type="text">       single-line
TextAreaField    → <textarea>                multi-line
DateRangeField   → start <input> + end <input> + "Present" checkbox
StringListField  → list of <input>s with + Add and × remove buttons
```

### How a field change propagates

Take the user changing the "Company" field in an experience entry:

```
User types in <TextField value={entry.company}>
        │
        ▼ onChange fires
applyUpdate(newFormData)
        │
        ├─ setFormData(newFormData)     → re-renders the form
        │
        └─ serializeCvToYaml(newFormData)
                │
                ▼
           onYamlChange(yamlString)
                │
                ▼
           App.jsx → setYamlText(yamlString)
                │
                ├─ parseCV() → setParsedCV() → CVPreview re-renders
                └─ debounce → saveCV() → localStorage
```

---

## 10. The CV Preview — how YAML becomes a page

The preview pipeline has three layers:

```
parsedCV (object)
      │
      ▼
  CVPreview.jsx          Paginates the content into pages
      │
      ├─ CVHeader.jsx    Renders name, headline, contact info
      │
      └─ CVSection.jsx × N  One per section in the YAML
              │
              └─ Entry component × N  One per entry
                    ├── EntryEducation
                    ├── EntryExperience
                    ├── EntryProject
                    ├── EntryPublication
                    ├── EntrySkill
                    └── EntryGeneric
```

### CVPreview.jsx

Receives `cvData` (the parsed object) and `zoom` (the scale factor).

Applies zoom with a CSS transform:
```jsx
<div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
```

The page is always rendered at 816×1056px (US Letter at 96 DPI). The zoom only affects how large it appears on screen — it does not change the rendered content size.

### CVSection.jsx

Receives a section `title` (like `"education"`) and an `entries` array.

1. Formats the title with `formatSectionTitle('selected_honors')` → `"Selected Honors"`
2. Maps each entry to the correct component using `detectEntryType(entry)`
3. If all entries are bullet-type, wraps them in a `<ul>` for proper list styling

---

## 11. Entry type detection — how the renderer knows what to show

`detectEntryType(entry)` in `src/utils/yamlParser.js` reads the **fields present** in an entry object and returns a type string.

```
entry has "institution"?                              → "education"
entry has "company"?                                  → "experience"
entry has "title" AND "authors"?                      → "publication"
entry has "name" AND ("start_date" OR "date" OR "highlights")? → "project"
entry has "label" AND "details"?                      → "skill"
entry has "bullet"?                                   → "bullet"
entry has "reversed_number" OR "number"?              → "numbered"
entry has "summary" (only)?                           → "summary"
everything else                                       → "text"
```

**Why detect by fields instead of section name?**

Because section names are free-form. If someone writes a section named `jobs` instead of `experience`, the entries still have a `company` field, so they render correctly. The renderer doesn't care what the section is called.

---

## 12. Pagination — fitting content across multiple pages

This is one of the trickiest parts of the app, and it runs in **two places**: the live preview and the PDF export. Both use the same algorithm to guarantee they match.

### The problem

HTML doesn't know about page breaks. If you just render the CV as a long document, it will overflow a single page. We need to manually calculate where to cut the content.

### The algorithm

```
usePagination(cvData, paddingV, template)
```

**Step 1 — Render everything off-screen**

All CV content is rendered in a hidden div at `left: -9999px` (off-screen but still in the DOM, so the browser computes layout).

```jsx
<div style={{ position: 'absolute', left: -9999, width: 816 }}>
  <CVHeader cv={cvData} />
  {sections.map(section => <CVSection ... />)}
</div>
```

**Step 2 — Wait for fonts**

```js
await document.fonts.ready
```

This is critical. If you measure before fonts load, the browser uses a fallback font that may be a different size, giving wrong heights.

**Step 3 — Measure each block's height**

The trick is to use `getBoundingClientRect()` differences instead of individual `offsetHeight` values:

```
Why? CSS margin collapsing.

When two elements are stacked, the margin between them collapses to
the larger of the two margins. offsetHeight includes the element's own
margin but not the collapsed part. Using top-position differences
captures the real distance between elements.

child[n].top - child[n-1].top = actual rendered height including spacing
```

**Step 4 — Greedy bin-packing**

```
availableHeight = PAGE_HEIGHT_PX - (paddingV * 2)
                = 1056px - 64px
                = 992px

currentPage = []
currentHeight = 0

for each block (header, section1, section2, ...):
  if currentHeight + block.height > availableHeight:
    → save currentPage to pages
    → start new currentPage
    → currentHeight = 0
  add block to currentPage
  currentHeight += block.height

save last currentPage to pages
```

This produces an array of pages, where each page is an array of blocks that fit within 992px.

---

## 13. Inline markdown rendering

`src/utils/markdown.js` exports `renderMarkdown(text)`.

### Security first

The function **escapes all HTML before doing anything else**:

```js
text = text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
```

This prevents XSS (Cross-Site Scripting). If someone writes `<script>alert(1)</script>` in a CV field, it renders as literal text, not executed code.

Only after escaping does it apply markdown transformations:

```
**bold**      → <strong>bold</strong>
*italic*      → <em>italic</em>
[text](url)   → <a href="url">text</a>   (only http/https URLs allowed)
```

The result is used with `dangerouslySetInnerHTML` in the `<MD>` component — which is safe because the HTML was sanitized above.

---

## 14. Templates — changing the visual style

### Definition (`src/templates/index.js`)

Each template is a JavaScript object with metadata:

```js
const TEMPLATES = {
  harvard: {
    id: 'harvard',
    label: 'Harvard',
    font: 'Times New Roman, serif',
    paddingH: 58,   // horizontal page padding in px
    paddingV: 32,   // vertical page padding in px
    dateFormat: 'month-year',
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    font: 'Charter, Georgia, Times New Roman, serif',
    paddingH: 58,
    paddingV: 32,
    dateFormat: 'year',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    font: 'Inter, Segoe UI, sans-serif',
    paddingH: 44,
    paddingV: 28,
    dateFormat: 'month-year',
  },
}
```

### Visual styling (`src/styles/cv-*.css`)

Each template has its own CSS file that targets the `.cv-page` element with a `data-template` attribute:

```css
/* cv-harvard.css */
[data-template="harvard"] .cv-section-title { ... }
[data-template="harvard"] .cv-entry { ... }
```

When the user switches templates, the `data-template` attribute on the page container changes, and the correct CSS rules activate automatically — no JavaScript style manipulation needed.

### Where the template is applied

The template ID flows from:

```
TemplateContext (global state)
      │
      ▼
App.jsx reads template → passes to CVPreview
      │
      ▼
CVPreview applies data-template={template.id} to the page div
      │
      ▼
CSS rules for that template activate
      │
      ▼
Entry components call useTemplate() → get dateFormat → format dates correctly
```

---

## 15. PDF export — the full pipeline

`src/utils/pdfExport.jsx` exports `exportToPDF(cvData, filename, templateId)`.

### Constants

```js
PAGE_WIDTH_PX  = 816    // US Letter at 96 DPI
PAGE_HEIGHT_PX = 1056
PDF_WIDTH_PT   = 612    // US Letter in PDF points (72pt per inch)
PDF_HEIGHT_PT  = 792
CANVAS_SCALE   = 3      // Render at 3x resolution for sharpness
```

### Step 1 — Measure (identical to preview pagination)

Mount the full CV in a hidden off-screen div. Wait for fonts. Measure each block's height. Run the greedy bin-packing algorithm to produce an array of pages.

This uses the template's `paddingV` to calculate the available height correctly.

### Step 2 — Render each page and capture

For each page in the array:

```
1. Create a detached DOM container (816 × 1056px)
2. Mount the page content using ReactDOM.createRoot()
   → Wrap in TemplateStaticProvider (lock the template)
   → Render CVHeader + all CVSections for this page
3. Append container to document.body so it's visible to html2canvas
4. Wait 150ms (fonts finish applying to the new container)
5. html2canvas(container, { scale: 3, backgroundColor: '#fff' })
   → returns a <canvas> element at 2448 × 3168px
6. canvas.toDataURL('image/jpeg', 0.92)
   → returns a base64 JPEG string
7. Remove container from document.body
```

### Step 3 — Build the PDF

```
jsPDF({ format: 'letter', unit: 'pt' })

for each page:
  if not first page: pdf.addPage()
  pdf.addImage(jpegData, 'JPEG', 0, 0, 612, 792)

pdf.save('my-cv.pdf')
```

### Why JPEG instead of PNG?

PDF files with high-resolution PNGs can be very large (5–20 MB). JPEG at 0.92 quality produces files that look identical to a human eye but are 3–5× smaller. The 3× canvas scale ensures sharpness even at JPEG compression.

### Why html2canvas instead of a PDF library?

Libraries like `@react-pdf/renderer` require you to re-implement the entire CV layout in a special JSX subset. Every CSS feature you use must be manually supported by the library. Since EditCV's layout relies on standard CSS (flexbox, margin collapsing, `::before` pseudo-elements, etc.), it's simpler and more correct to render to a DOM and take a screenshot.

---

## 16. Complete data flow diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER ACTION                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │  A) Types in Form          B) Types in Monaco         C) Loads page
         │
         ▼                                   ▼                        ▼
  FormEditor.jsx                       Editor.jsx               App.jsx boots
  serializeCvToYaml()                  onChange(value)          loadCVs()
  onYamlChange(yaml)                   onYamlChange(yaml)       setYamlText(cv.yaml)
         │                                   │                        │
         └──────────────────┬────────────────┘                        │
                            │                                         │
                            ▼                                         │
                    App.jsx setYamlText ◄────────────────────────────┘
                            │
               ┌────────────┼─────────────────────┐
               │            │                     │
               ▼            ▼                     ▼
        parseCV()      debounce 600ms      MonacoEditor
        parsedCV       saveCV()            shows new value
              │        localStorage
              │
      ┌───────┴───────────────────────────┐
      │                                   │
      ▼                                   ▼
 FormEditor                          CVPreview
 reads parsedCV                      reads parsedCV
 updates form fields                 usePagination()
 (skipSync if self-triggered)              │
                                           │  Measure off-screen
                                           │  Paginate into pages
                                           │
                                           ▼
                                  Render page containers
                                  CVHeader + CVSection × N
                                  Each CVSection routes entries to:
                                  EntryEducation / EntryExperience /
                                  EntryProject / EntryPublication /
                                  EntrySkill / EntryGeneric
                                           │
                                           ▼
                                  Apply template CSS
                                  [data-template="harvard"] etc.
                                           │
                                           ▼
                                  Visible preview on screen
                                           │
                            ┌──────────────┘
                            │  User clicks "Download PDF"
                            ▼
                     pdfExport.jsx
                     measure → paginate → render off-screen
                     html2canvas × N pages
                     jsPDF.addImage × N pages
                     pdf.save('cv.pdf')
```

---

## 17. File-by-file reference

```
src/
│
├── main.jsx
│     Entry point. Mounts <App> into #root. Imports global + template CSS.
│
├── App.jsx
│     Shell component. Owns all top-level state. Renders layout.
│     The three effects (bootstrap, live parse, auto-save) live here.
│
├── context/
│   ├── ThemeContext.jsx
│   │     Provides { theme, toggle }. Writes data-theme to <html>.
│   └── TemplateContext.jsx
│         Provides { template, setTemplate }. Two variants: dynamic and static.
│
├── templates/
│   └── index.js
│         Template objects: id, label, font, paddingH, paddingV, dateFormat.
│         Imported by TemplateContext, CVPreview, pdfExport.
│
├── styles/
│   ├── global.css        CSS variables, reset, app layout (flexbox)
│   ├── cv-harvard.css    CV page styles for harvard template
│   ├── cv-classic.css    CV page styles for classic template
│   └── cv-modern.css     CV page styles for modern template
│
├── utils/
│   ├── yamlParser.js
│   │     parseCV(str)           → { data, error }
│   │     detectEntryType(entry) → type string
│   │     formatSectionTitle(key)→ "Title Case"
│   │     formatDateRange(...)   → "Jan 2022 – Present"
│   │
│   ├── storage.js
│   │     loadCVs / saveCV / deleteCV / createCV
│   │     getActiveId / setActiveId
│   │     defaultYaml(name) → starter YAML template
│   │
│   ├── pdfExport.jsx
│   │     exportToPDF(cvData, filename, templateId)
│   │     measure → paginate → render → html2canvas → jsPDF → download
│   │
│   └── markdown.js
│         renderMarkdown(text) → safe HTML string
│         isSafeUrl(url)       → boolean
│
├── components/
│   │
│   ├── Navbar/
│   │   └── Navbar.jsx    Logo + theme toggle. Uses useTheme().
│   │
│   ├── Sidebar/
│   │   └── Sidebar.jsx   CV list. Create / rename / delete CVs.
│   │                     Props: cvs, activeCVId, onSelect, onCVsChange
│   │
│   ├── Editor/
│   │   ├── Editor.jsx
│   │   │     Tabs: Form ↔ YAML. Shows error badge. Passes data to both.
│   │   │     Props: value, onChange, error, parsedCV
│   │   │
│   │   ├── FormEditor.jsx
│   │   │     Full form UI. All form primitives defined inside.
│   │   │     Props: cvData, onYamlChange
│   │   │
│   │   └── FormEditor.css
│   │         Form layout and theming via CSS variables.
│   │
│   └── CVPreview/
│       ├── CVPreview.jsx
│       │     usePagination() hook. Renders hidden measurement container.
│       │     Renders visible pages at zoom level.
│       │     Props: cvData, zoom
│       │
│       ├── CVSection.jsx
│       │     Renders section title + routes entries to component types.
│       │     Props: title, entries
│       │
│       ├── MD.jsx
│       │     Renders markdown-to-HTML safely via dangerouslySetInnerHTML.
│       │     Props: text, className, tag
│       │
│       └── sections/
│           ├── CVHeader.jsx         name, headline, contact row
│           ├── EntryEducation.jsx   institution, degree, dates, highlights
│           ├── EntryExperience.jsx  company, position, dates, highlights
│           ├── EntryProject.jsx     name (link), dates, summary, highlights
│           ├── EntryPublication.jsx title, authors, journal, doi, url
│           ├── EntrySkill.jsx       label: details (inline)
│           └── EntryGeneric.jsx     bullet / numbered / free text
```

---

## 18. Gotchas and non-obvious decisions

### Margin collapsing in height measurement

CSS margin collapsing is a browser rule: when two block elements are stacked, the vertical space between them is the *maximum* of their two margins, not the sum. This means you can't reliably use `element.offsetHeight` (which includes the element's own margins but not the collapsed overlap).

The fix used in `usePagination` and `pdfExport` is to measure the **distance between top positions** of consecutive children, which captures the real rendered spacing.

### 150ms delay in PDF export

After mounting a React component into a detached DOM node and appending it to `document.body`, there's a small window where fonts haven't finished applying (even after `document.fonts.ready`). The 150ms delay is empirical — enough for the browser to finish painting before `html2canvas` captures the screenshot.

### `TemplateStaticProvider` in PDF export

During PDF rendering, multiple pages are rendered sequentially. If the user were to change the template mid-export (unlikely but possible), it would corrupt the output. `TemplateStaticProvider` is a read-only context provider that takes a `templateId` prop and ignores any `setTemplate` calls — the template is frozen for the duration of the export.

### `skipNextSyncRef` in FormEditor

Without this ref, the form and YAML would trigger each other in an infinite loop: form update → YAML changes → `cvData` prop changes → form updates → YAML changes → ...

The ref breaks the cycle by flagging self-triggered updates so the form ignores the next prop change that it caused itself.

### `document.fonts.ready` before measuring

The pagination algorithm measures DOM heights. If fonts haven't loaded yet, the browser falls back to a system font that is usually narrower than the intended font. Narrower text wraps differently and produces wrong heights. Awaiting `document.fonts.ready` ensures measurements are taken with the correct font.

### US Letter dimensions at 96 DPI

The CV page is rendered at exactly 816 × 1056px. This is because:
```
8.5 inches × 96 DPI = 816px
11.0 inches × 96 DPI = 1056px
```
The PDF uses 612 × 792 points (1 inch = 72 points in PDF space). The canvas is captured at 3× scale (2448 × 3168px) and then scaled down to fit the PDF page — this 3× oversample is what makes text and thin lines look sharp.

---

*This document describes the codebase as of May 2026. If you add a new feature, update the relevant sections.*
