export const TEMPLATES = {
  harvard: {
    id: 'harvard',
    label: 'Harvard',
    fontFamily: "'Times New Roman', Times, serif",
    paddingH: 58,
    paddingV: 32,
    dateFormat: 'month-year', // "Oct 2022"
    backgroundColor: '#ffffff',
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    fontFamily: "'Charter', 'Georgia', 'Times New Roman', serif",
    paddingH: 58,
    paddingV: 32,
    dateFormat: 'year', // "2022"
    backgroundColor: '#ffffff',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    paddingH: 44,
    paddingV: 28,
    dateFormat: 'month-year', // "Oct 2022"
    backgroundColor: '#ffffff',
  },
}

export const DEFAULT_TEMPLATE = 'harvard'
