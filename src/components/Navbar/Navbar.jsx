import { useTheme } from '../../context/ThemeContext'

export default function Navbar() {
  const { theme, toggle } = useTheme()

  return (
    <nav className="navbar">
      <span className="logo">EditCV</span>
      <button className="themeBtn" onClick={toggle} title="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}
