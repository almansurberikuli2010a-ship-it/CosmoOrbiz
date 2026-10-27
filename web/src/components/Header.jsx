import { useEffect, useState } from 'react'
import { LANGS, useI18n } from '../i18n/index.jsx'

export default function Header() {
  const { d, lang, setLang } = useI18n()
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`site-header ${solid ? 'solid' : ''}`}>
      <a className="logo" href="#globe" aria-label="Cosmo Orbiz">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="13" fill="currentColor" opacity="0.9" />
          <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="currentColor" strokeWidth="3.2" transform="rotate(-24 32 32)" />
          <circle cx="56.5" cy="22" r="4.2" fill="#ff9b3d" />
        </svg>
        <span>Cosmo Orbiz</span>
      </a>
      <nav className="site-nav" aria-label="nav">
        <a href="#globe">{d.nav.globe}</a>
        <a href="#facts">{d.nav.facts}</a>
        <a href="#live">{d.nav.live}</a>
        <a href="#kessler">{d.nav.kessler}</a>
        <a href="#model">{d.nav.model}</a>
      </nav>
      <div className="lang-switch" role="group" aria-label={d.nav.language}>
        {LANGS.map((l) => (
          <button key={l.code} className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>
            {l.label}
          </button>
        ))}
      </div>
    </header>
  )
}
