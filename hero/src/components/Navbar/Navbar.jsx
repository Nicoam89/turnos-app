import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'
import styles from './Navbar.module.scss'

const navLinks = [
  { label: 'Funciones',     to: 'features' },
  { label: 'Precios',       to: 'pricing'  },
  { label: 'Especialidades',to: 'features' },
  { label: 'Soporte',       to: 'pricing'  },
]

function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>

        {/* Logo */}
        <div className={styles.logo}>
          <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
            <path
              d="M19 7C12.373 7 7 12.373 7 19C7 25.627 12.373 31 19 31C22.2 31 25.1 29.77 27.26 27.74"
              stroke="url(#ng1)" strokeWidth="3" strokeLinecap="round"
            />
            <path
              d="M22 22L29 29"
              stroke="url(#ng2)" strokeWidth="3" strokeLinecap="round"
            />
            <defs>
              <linearGradient id="ng1" x1="7" y1="7" x2="31" y2="31" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00d4c8" />
                <stop offset="1" stopColor="#00b8d9" />
              </linearGradient>
              <linearGradient id="ng2" x1="22" y1="22" x2="29" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00b8d9" />
                <stop offset="1" stopColor="#00d4c8" />
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.logoText}>CliniQ</span>
        </div>

        {/* Links desktop */}
        <ul className={styles.links}>
          {navLinks.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                smooth
                duration={500}
                offset={-80}
                className={styles.link}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <Link
          to="pricing"
          smooth
          duration={500}
          offset={-80}
          className={styles.cta}
        >
          Comenzar gratis
        </Link>

        {/* Burger mobile */}
        <button
          className={styles.burger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menú"
        >
          {menuOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <ul>
          {navLinks.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                smooth
                duration={500}
                offset={-80}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="pricing"
          smooth
          duration={500}
          className={styles.mobileCta}
          onClick={() => setMenuOpen(false)}
        >
          Comenzar gratis
        </Link>
      </div>
    </nav>
  )
}

export default Navbar