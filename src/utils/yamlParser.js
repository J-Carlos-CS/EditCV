import yaml from 'js-yaml'

export function parseCV(yamlString) {
  try {
    const raw = yaml.load(yamlString)
    if (!raw || !raw.cv) throw new Error('El YAML debe tener una clave raiz "cv"')
    return { data: raw.cv, error: null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

// Detects entry type by its fields
export function detectEntryType(entry) {
  if (!entry || typeof entry !== 'object') return 'bullet'
  if ('institution' in entry) return 'education'
  if ('company' in entry) return 'experience'
  if ('title' in entry && 'authors' in entry) return 'publication'
  if ('name' in entry && ('start_date' in entry || 'date' in entry || 'highlights' in entry)) return 'project'
  if ('label' in entry && 'details' in entry) return 'skill'
  if ('bullet' in entry) return 'bullet'
  if ('reversed_number' in entry) return 'numbered'
  if ('number' in entry) return 'numbered'
  if ('summary' in entry && !('bullet' in entry) && !('institution' in entry) && !('company' in entry) && !('name' in entry)) return 'summary'
  if (typeof entry === 'string') return 'text'
  return 'text'
}

export function formatDateRange(startDate, endDate, date) {
  if (date) return String(date)
  const start = startDate ? String(startDate).replace(/-\d{2}$/, '').replace('-', '/') : ''
  const end = endDate
    ? endDate === 'present'
      ? 'Present'
      : String(endDate).replace(/-\d{2}$/, '').replace('-', '/')
    : ''
  if (start && end) return `${start} – ${end}`
  if (start) return start
  if (end) return end
  return ''
}
