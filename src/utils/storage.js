const STORAGE_KEY = 'editcv_cvs'
const ACTIVE_KEY = 'editcv_active'

export function loadCVs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function saveCV(cv) {
  const cvs = loadCVs()
  const idx = cvs.findIndex(c => c.id === cv.id)
  if (idx >= 0) cvs[idx] = cv
  else cvs.push(cv)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs))
}

export function deleteCV(id) {
  const cvs = loadCVs().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs))
}

export function createCV(name = 'Nuevo CV') {
  return {
    id: Date.now().toString(),
    name,
    yaml: defaultYaml(name),
    updatedAt: new Date().toISOString(),
  }
}

export function getActiveId() {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

function defaultYaml(name) {
  return `cv:
  name: "${name}"
  headline: ""
  location: ""
  email: ""
  phone: ""
  website: ""
  social_networks:
    - network: LinkedIn
      username: ""
  sections:
    education:
      - institution: ""
        area: ""
        degree: ""
        start_date: 2020-09
        end_date: 2024-06
        location: ""
        highlights:
          - ""
    experience:
      - company: ""
        position: ""
        start_date: 2024-07
        end_date: present
        location: ""
        highlights:
          - ""
    skills:
      - label: Languages
        details: ""
`
}
