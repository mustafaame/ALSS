"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Lang = "en" | "ar"

type I18nContextType = {
  lang: Lang
  setLang: (l: Lang) => void
}

const I18nContext = createContext<I18nContextType>({ lang: "en", setLang: () => {} })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem("alss:lang") as Lang | null
    const v: Lang = raw === "ar" ? "ar" : "en"
    setLangState(v)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("alss:lang", lang)
    }
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)
  const value = useMemo(() => ({ lang, setLang }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  return useContext(I18nContext)
}
