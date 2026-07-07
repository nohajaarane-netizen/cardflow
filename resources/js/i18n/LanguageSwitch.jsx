import React from 'react'
import { C } from '../admin/theme'
import { useLanguage } from './LanguageContext'

export default function LanguageSwitch() {
    const { lang, setLang } = useLanguage()

    return (
        <div style={{
            display: 'flex', border: `1.5px solid ${C.border}`, borderRadius: 999,
            padding: 3, background: C.white, flexShrink: 0,
        }}>
            {['fr', 'en'].map(code => (
                <button
                    key={code}
                    onClick={() => setLang(code)}
                    style={{
                        border: 'none', borderRadius: 999, padding: '0.4rem 0.75rem',
                        fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                        background: lang === code ? C.navy : 'transparent',
                        color: lang === code ? 'white' : C.muted,
                        transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                >
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    )
}
