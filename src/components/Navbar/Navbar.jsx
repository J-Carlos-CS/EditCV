import { useTheme } from '../../context/ThemeContext'

const IconSun = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="7.5" cy="7.5" r="2.5"/>
    <line x1="7.5" y1="1" x2="7.5" y2="2.5"/>
    <line x1="7.5" y1="12.5" x2="7.5" y2="14"/>
    <line x1="1" y1="7.5" x2="2.5" y2="7.5"/>
    <line x1="12.5" y1="7.5" x2="14" y2="7.5"/>
    <line x1="3" y1="3" x2="4.1" y2="4.1"/>
    <line x1="10.9" y1="10.9" x2="12" y2="12"/>
    <line x1="12" y1="3" x2="10.9" y2="4.1"/>
    <line x1="4.1" y1="10.9" x2="3" y2="12"/>
  </svg>
)

const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9A6 6 0 0 1 5 2a6 6 0 1 0 7 7z"/>
  </svg>
)

export default function Navbar() {
  const { theme, toggle } = useTheme()

  return (
    <nav className="navbar">
      <span className="logo">EditCV</span>
      <button className="themeBtn" onClick={toggle} title="Toggle theme">
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>
    </nav>
  )
}
