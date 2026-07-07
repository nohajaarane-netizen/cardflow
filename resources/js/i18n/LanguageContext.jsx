import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

function interpolate(str, vars) {
    if (!vars) return str
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`))
}

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => localStorage.getItem('cf_lang') || 'fr')

    const setLang = useCallback((next) => {
        setLangState(next)
        localStorage.setItem('cf_lang', next)
    }, [])

    const t = useCallback((key, vars) => {
        const dict = translations[lang] || translations.fr
        const str = dict[key] ?? translations.fr[key] ?? key
        return interpolate(str, vars)
    }, [lang])

    const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    return useContext(LanguageContext)
}
