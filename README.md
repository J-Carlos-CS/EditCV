# ✦ EditCV

> **Crea CVs profesionales en formato Harvard escribiendo solo YAML.**
> Sin cuentas, sin servidores, sin límites — todo corre en tu navegador.

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-61dafb?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ¿Qué es EditCV?

EditCV es una aplicación web que convierte un archivo YAML en un CV con formato **Harvard** — el estándar usado en universidades como MIT, Harvard y Stanford. Escribís tu información una vez en YAML y el sistema se encarga del diseño, tipografía y layout en tamaño **carta (US Letter 8.5" × 11")**.

---

## ✦ Features

| Feature | Descripción |
|---|---|
| 📝 **Editor YAML** | Editor con soporte de Tab, syntax-aware y detección de errores en tiempo real |
| 👁 **Preview en vivo** | El CV se actualiza al instante mientras escribís |
| 📄 **Formato Harvard** | Tipografía Times New Roman, secciones centradas con líneas, layout profesional |
| 💾 **Guardado automático** | Cada cambio se guarda en `localStorage` con debounce de 600ms |
| 📂 **Múltiples CVs** | Creá, renombrá y eliminá CVs desde el sidebar |
| ⬇ **Exportar a PDF** | Descarga directa en tamaño carta, lista para enviar |
| 🌙 **Dark / Light mode** | Tema oscuro por defecto, toggle en la navbar |
| 🔌 **100% offline** | No hay backend, no hay base de datos, no hay tracking |

---

## ✦ Demo rápida

```
1. Abrís la app
2. Pegás tu YAML en el editor de la izquierda
3. El CV aparece a la derecha en tiempo real
4. Hacés clic en "Descargar PDF"
5. Listo — CV listo para enviar
```

---

## ✦ Estructura del proyecto

```
EditCV/
│
├── index.html                  # Entry point HTML
├── vite.config.js              # Configuración de Vite
├── package.json
│
└── src/
    ├── main.jsx                # Monta la app en el DOM
    ├── App.jsx                 # Componente raíz — orquesta todo
    ├── App.module.css          # Layout principal (3 paneles)
    │
    ├── context/
    │   └── ThemeContext.jsx    # Estado global del tema (dark/light)
    │
    ├── styles/
    │   └── global.css          # Variables CSS, reset, scrollbar
    │
    ├── utils/
    │   ├── yamlParser.js       # Parsea YAML y detecta tipo de entrada
    │   ├── storage.js          # CRUD sobre localStorage
    │   ├── pdfExport.js        # Exportación a PDF (html2canvas + jsPDF)
    │   └── markdown.js         # Parser inline: **bold**, *italic*, [link](url)
    │
    └── components/
        ├── Navbar/
        │   ├── Navbar.jsx      # Barra superior con toggle de tema
        │   └── Navbar.module.css
        │
        ├── Sidebar/
        │   ├── Sidebar.jsx     # Lista de CVs + crear/renombrar/eliminar
        │   └── Sidebar.module.css
        │
        ├── Editor/
        │   ├── Editor.jsx      # Textarea con soporte de Tab y manejo de errores
        │   └── Editor.module.css
        │
        └── CVPreview/
            ├── CVPreview.jsx         # Página carta — recibe cvData y renderiza
            ├── CVSection.jsx         # Detecta tipo de sección y delega al entry correcto
            ├── CVPreview.module.css  # Estilos Harvard (tipografía, layout, colores)
            ├── MD.jsx                # Componente para renderizar markdown inline
            │
            └── sections/
                ├── CVHeader.jsx          # Nombre, headline, contacto
                ├── EntryEducation.jsx    # institution + degree + highlights
                ├── EntryExperience.jsx   # company + position + highlights
                ├── EntryProject.jsx      # name + summary + highlights
                ├── EntryPublication.jsx  # title + authors + journal + doi
                ├── EntrySkill.jsx        # label: details
                └── EntryGeneric.jsx      # bullet / reversed_number / texto libre
```

---

## ✦ Cómo correr el proyecto

### Requisitos
- Node.js 18+
- npm 9+

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/editcv.git
cd editcv

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abrí `http://localhost:5173` en tu navegador.

### Build para producción

```bash
npm run build      # genera la carpeta dist/
npm run preview    # previsualiza el build
```

---

## ✦ Estructura del YAML

El YAML tiene una clave raíz `cv:` con información personal y una clave `sections:` donde cada clave es el **título de la sección** (puede ser cualquier nombre) y el valor es una lista de entradas.

```yaml
cv:
  # ── Información personal ─────────────────────────────
  name: "Tu Nombre Completo"
  headline: "Tu título profesional"        # opcional
  location: "Ciudad, País"
  email: "tu@email.com"
  phone: "+1 234 567 890"                  # opcional
  website: "https://tu-sitio.com"          # opcional
  photo:                                   # opcional (reservado)

  social_networks:                         # opcional
    - network: LinkedIn
      username: tu-usuario
    - network: GitHub
      username: tu-usuario

  # ── Secciones ────────────────────────────────────────
  sections:

    # El nombre de la sección es libre — aparece como título en el CV
    summary:
      - "Párrafo de texto libre. Soporta **markdown** en *cualquier campo*."

    experience:
      - company: "Nombre de la empresa"
        position: "Tu cargo"
        start_date: 2022-01             # formato: YYYY-MM
        end_date: present               # o YYYY-MM
        location: "Ciudad, País"
        summary:                        # opcional
        highlights:
          - "Logro con **métricas** concretas"
          - "Otro logro importante"

    education:
      - institution: "Universidad"
        area: "Carrera o área de estudio"
        degree: "PhD / MSc / BE / BA"   # opcional
        start_date: 2018-09
        end_date: 2023-05
        location: "Ciudad, País"
        summary:                        # opcional
        highlights:
          - "Tesis, honores, GPA, etc."

    projects:
      - name: "[Nombre del proyecto](https://link-opcional.com)"
        start_date: 2023-01
        end_date: present
        location:                       # opcional
        summary: "Descripción breve del proyecto"
        highlights:
          - "Detalle técnico o logro"

    publications:
      - title: "Título del paper"
        authors:
          - "*Tu Nombre*"               # asteriscos = autor principal
          - "Coautor Uno"
        journal: "NeurIPS 2023"
        date: 2023-07
        doi: 10.1234/ejemplo.5678       # opcional
        url: https://paper-url.com      # opcional
        summary:                        # opcional

    skills:
      - label: "Lenguajes"
        details: "Python, JavaScript, Go"
      - label: "Frameworks"
        details: "React, FastAPI, .NET Core"

    # Sección de bullets simples (honors, awards, talks, patents...)
    selected_honors:
      - bullet: "Premio o reconocimiento (2024)"
      - bullet: "Otro reconocimiento (2023)"

    invited_talks:
      - reversed_number: "Título de la charla — Evento (2024)"

    patents:
      - number: "Título del patent (US Patent 12,345,678)"

    languages:
      - label: "Español"
        details: "Nativo"
      - label: "Inglés"
        details: "B2 Upper Intermediate"
```

---

## ✦ Detección automática de tipo de entrada

El sistema detecta qué componente usar mirando los **campos presentes** en cada entrada — no el nombre de la sección. Esto significa que podés nombrar tus secciones como quieras:

| Campos presentes | Tipo detectado | Componente |
|---|---|---|
| `institution` | Educación | `EntryEducation` |
| `company` | Experiencia | `EntryExperience` |
| `title` + `authors` | Publicación | `EntryPublication` |
| `name` + (`start_date` o `highlights`) | Proyecto | `EntryProject` |
| `label` + `details` | Skill | `EntrySkill` |
| `bullet` | Bullet simple | `EntryGeneric` |
| `reversed_number` o `number` | Item numerado | `EntryGeneric` |
| `string` puro | Texto libre | `EntryGeneric` |

**Ejemplo:** podés llamar la sección `trabajos` en lugar de `experience` y funcionará igual, porque las entradas tienen el campo `company`.

---

## ✦ Soporte de Markdown inline

En cualquier campo de texto podés usar:

| Sintaxis | Resultado |
|---|---|
| `**texto**` | **negrita** |
| `*texto*` | *cursiva* |
| `[texto](url)` | enlace |

Ejemplo en el YAML:
```yaml
highlights:
  - "Reducción de latencia en **73%** comparado con baseline"
  - "Paper publicado en [NeurIPS 2023](https://neurips.cc)"
  - "**Stack:** React, Node.js, PostgreSQL"
```

---

## ✦ Persistencia (localStorage)

Todos los CVs se guardan automáticamente en el `localStorage` del navegador. No necesitás hacer nada manual.

| Clave | Contenido |
|---|---|
| `editcv_cvs` | Array con todos los CVs (id, name, yaml, updatedAt) |
| `editcv_active` | ID del CV activo |
| `editcv_theme` | Tema activo (`dark` o `light`) |

> Los datos persisten aunque cierres el navegador o reinicies la computadora. Se borran solo si limpiás el `localStorage` manualmente o usás modo incógnito.

---

## ✦ Exportación a PDF

El PDF se genera capturando el elemento HTML del preview con `html2canvas` y convirtiéndolo a PDF con `jsPDF`.

- Tamaño: **US Letter (8.5" × 11")**
- Escala: **2x** para alta resolución
- Fondo: **blanco** (ignora el tema oscuro de la UI)
- Nombre del archivo: `{nombre-del-cv}.pdf`

> El botón "Descargar PDF" está deshabilitado si hay errores de sintaxis en el YAML.

---

## ✦ Layout de la interfaz

```
┌─────────────────────────────────────────────────────────────┐
│  EditCV                                          [ ☀️ / 🌙 ] │  ← Navbar
├──────────────┬──────────────────┬───────────────────────────┤
│              │                  │                           │
│  + Nuevo CV  │   YAML Editor    │    Preview — US Letter    │
│  ──────────  │                  │                           │
│  > Mi CV     │  cv:             │  ┌─────────────────────┐  │
│    CV 2      │    name: "..."   │  │   Jose Carlos ...   │  │
│              │    sections:     │  │  ─── experience ─── │  │
│              │      ...         │  │  NICE CXone    2022  │  │
│              │                  │  │  • Bullet ...        │  │
│  Sidebar     │  Editor          │  └─────────────────────┘  │
│  (fijo)      │  (scroll)        │    Preview (scroll)        │
└──────────────┴──────────────────┴───────────────────────────┘
```

- **Sidebar** (220px, fijo): lista de CVs con crear/renombrar/eliminar
- **Editor** (380px): textarea monospace con detección de errores
- **Preview** (flex): página carta con scroll, botón de descarga arriba

---

## ✦ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev) | 18 | UI y componentes |
| [Vite](https://vitejs.dev) | 5 | Bundler y dev server |
| [js-yaml](https://github.com/nodeca/js-yaml) | 4 | Parsear YAML en el browser |
| [html2canvas](https://html2canvas.hertzen.com) | 1.4 | Capturar el CV como imagen |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5 | Generar el archivo PDF |

Sin backend. Sin base de datos. Sin autenticación. Sin dependencias de red en runtime.

---

## ✦ Decisiones de diseño

**¿Por qué YAML?**
Es más legible que JSON y más simple que un formulario con 50 campos. Un ingeniero puede escribir su CV en YAML en 10 minutos y mantenerlo en un repositorio de git como cualquier otro archivo de configuración.

**¿Por qué formato Harvard?**
Es el estándar más reconocido internacionalmente para CVs académicos y técnicos. Sin colores, sin fotos, sin columnas — solo contenido bien organizado.

**¿Por qué localStorage en lugar de un backend?**
Cero fricción de onboarding. No hay cuentas, no hay API keys, no hay latencia. Para un CV personal, localStorage es más que suficiente.

**¿Por qué detección de tipo por campos y no por nombre de sección?**
Porque los nombres de sección son libres — alguien puede poner `trabajos` en lugar de `experience`. La detección por campos hace que el sistema sea robusto ante variaciones del usuario.

---

## ✦ Roadmap

- [ ] Resizer drag entre editor y preview
- [ ] Múltiples templates (además de Harvard)
- [ ] Exportar el YAML como archivo `.yaml`
- [ ] Importar YAML desde archivo
- [ ] Shortcut `Ctrl+S` para forzar guardado
- [ ] Numerar páginas en el PDF

---

## ✦ Licencia

MIT — libre para uso personal y comercial.
