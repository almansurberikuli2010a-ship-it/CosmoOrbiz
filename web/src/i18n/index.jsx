import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import ru from './ru.js'
import en from './en.js'
import kk from './kk.js'

export const LANGS = [
  { code: 'ru', label: 'RU', locale: 'ru-RU', dict: ru },
  { code: 'en', label: 'EN', locale: 'en-US', dict: en },
  // числа для казахского — как в ru-RU (тот же формат; не во всех браузерах есть данные для kk)
  { code: 'kk', label: 'KZ', locale: 'kk-KZ', numLocale: 'ru-RU', dict: kk },
]

const STORAGE_KEY = 'cosmo-orbiz-lang'
const I18nContext = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGS.some((l) => l.code === saved)) return saved
  } catch { /* приватный режим и т.п. */ }
  return 'ru'
}

/** Подставить {name} из vars в строку. */
export function fmt(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`))
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang)
  const value = useMemo(() => {
    const entry = LANGS.find((l) => l.code === lang)
    const numLocale = entry.numLocale || entry.locale
    const nf = new Intl.NumberFormat(numLocale)
    const pr = new Intl.PluralRules(entry.locale)
    return {
      /** Форма слова для числа: строка — одна форма на всё; массив [один, несколько, много] или [один, много]. */
      pl: (n, forms) => {
        if (typeof forms === 'string') return forms
        const cat = pr.select(n)
        if (forms.length === 3) return forms[cat === 'one' ? 0 : cat === 'few' ? 1 : 2]
        return forms[cat === 'one' ? 0 : forms.length - 1]
      },
      lang,
      setLang,
      d: entry.dict,
      locale: numLocale, // для чисел и дат
      num: (x, digits) => (digits == null ? nf.format(x)
        : new Intl.NumberFormat(numLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x)),
    }
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ничего */ }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
