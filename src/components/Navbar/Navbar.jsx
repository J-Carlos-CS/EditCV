import { useTheme } from '../../context/ThemeContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { theme, toggle } = useTheme()

  return (
    <nav className={styles.navbar}>
      <span className={styles.logo}>EditCV</span>
      <button className={styles.themeBtn} onClick={toggle} title="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}
