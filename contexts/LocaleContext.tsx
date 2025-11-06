"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Locale, defaultLocale, getTranslation } from "@/lib/i18n"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("locale") as Locale
      return saved || defaultLocale
    }
    return defaultLocale
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale)
      document.documentElement.lang = locale
    }
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
  }

  const t = (key: string) => getTranslation(locale, key)

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return context
}
