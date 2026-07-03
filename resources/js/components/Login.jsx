import React, { useState } from 'react'
import axios from 'axios'
import bgImage from '../assets/cardflow-bg.png'

const font      = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const fontTitle = "'Plus Jakarta Sans', 'Inter', sans-serif"

const C = {
    navy:    '#1A3A6B',
    blue:    '#3B82F6',
    blueDark:'#2563EB',
    muted:   '#94A3B8',
    border:  '#E8EDF5',
    bg:      '#EEF2FF',
    white:   '#FFFFFF',
    text:    '#1E293B',
    error:   '#EF4444',
}

export default function Login() {
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [remember, setRemember] = useState(false)
    const [error,    setError]    = useState('')
    const [loading,  setLoading]  = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await axios.post('/api/login', { email, password })
            const { token, user } = res.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            window.location.href = user.role === 'admin'
                ? '/admin/dashboard'
                : '/client/dashboard'
        } catch {
            setError('Email ou mot de passe incorrect.')
            setLoading(false)
        }
    }

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: font,
            background: C.bg,
        }}>

            {/* ══════ GAUCHE — Mockup CardFlow ══════ */}
            <div style={{
                flex: '1.2',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E8EFFF 100%)',
            }}>
                {/* Cercles décoratifs en arrière-plan */}
                <div style={{
                    position: 'absolute', 
                    top: '-160px', left: '-160px',
                    width: '520px', 
                    height: '520px', 
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.05)', 
                    pointerEvents: 'none',
                }}/>
                <div style={{
                    position: 'absolute', bottom: '-120px', right: '-120px',
                    width: '420px', height: '420px', borderRadius: '50%',
                    background: 'rgba(59,130,246,0.05)', pointerEvents: 'none',
                }}/>

                {/* Logo en haut à gauche */}
                <div style={{
                    position: 'absolute',
                    top: '2rem', left: '2rem',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="1" y="5" width="16" height="10" rx="2.5" fill="white" opacity="0.9"/>
                            <rect x="1" y="8.5" width="16" height="3" fill="white" opacity="0.4"/>
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontFamily: fontTitle, fontSize: '18px', fontWeight: '800', color: C.navy }}>CardFlow</div>
                        <div style={{ fontSize: '11px', color: C.muted }}>Gérez vos finances en toute simplicité</div>
                    </div>
                </div>

                {/* Image mockup */}
                <img
                    src={bgImage}
                    alt="CardFlow"
                    style={{
                        width: '100%',
                        maxWidth: '680px',
                        height: 'auto',
                        objectFit: 'contain',
                        margin: '0 auto',
                        filter: 'drop-shadow(0 20px 40px rgba(99,102,241,0.12))',
                    }}
                />
            </div>

            {/* ══════ DROITE — Formulaire ══════ */}
            <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}>
                {/* Carte blanche du formulaire */}
                <div style={{
                    background: C.white,
                    borderRadius: '30px',
                    padding: '2.5rem',
                    width: '180%',
                    maxWidth: '500px',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
                    border: `1px solid ${C.border}`,
                }}>

                    {/* Icône cadenas */}
                    <div style={{
                        width: '52px', height: '52px',
                        background: C.bg,
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.8rem',
                        border: `1px solid ${C.border}`,
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="11" width="18" height="11" rx="3" stroke={C.blue} strokeWidth="1.8"/>
                            <path d="M7 11V7a5 5 0 0110 0v4" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"/>
                            <circle cx="12" cy="16.5" r="1.5" fill={C.blue}/>
                        </svg>
                    </div>

                    {/* Titre */}
                    <h1 style={{
                        fontFamily: fontTitle,
                        fontSize: '40px', 
                        fontWeight: '800',
                        color: C.text, 
                        margin: '0 0 8px',
                        letterSpacing: '-0.5px',
                    }}>
                        Bienvenue
                    </h1>
                    <p style={{
                        fontSize: '16px', 
                        color: C.muted,
                        margin: '0 0 2rem',
                    }}>
                        Connectez-vous à votre espace CardFlow.
                    </p>

                    {/* Formulaire */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                        {/* Email */}
                        <div>
                            <label style={{ fontSize: '15px', fontWeight: '600', color: C.text, display: 'block', marginBottom: '8px' }}>
                                Adresse email :
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                                    width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="1" y="3" width="14" height="10" rx="2" stroke={C.muted} strokeWidth="1.3"/>
                                    <path d="M1 6l7 4 7-4" stroke={C.muted} strokeWidth="1.3"/>
                                </svg>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="exemple@cardflow.com"
                                    required
                                    style={{
                                        width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem',
                                        border: `1.5px solid ${C.border}`,
                                        borderRadius: '15px', fontSize: '14px',
                                        color: C.text, outline: 'none',
                                        background: '#F8FAFC', boxSizing: 'border-box',
                                        transition: 'all 0.2s', fontFamily: font,
                                    }}
                                    onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.background = C.white; }}
                                    onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.background = '#F8FAFC'; }}
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label style={{ fontSize: '15px', fontWeight: '600', color: C.text, display: 'block', marginBottom: '8px' }}>
                                Mot de passe :
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                                    width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="2" y="7.5" width="12" height="7" rx="2" stroke={C.muted} strokeWidth="1.3"/>
                                    <path d="M5 7.5V5a3 3 0 016 0v2.5" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    required
                                    style={{
                                        width: '100%', padding: '0.85rem 2.8rem 0.85rem 2.8rem',
                                        border: `1.5px solid ${C.border}`,
                                        borderRadius: '15px', fontSize: '14px',
                                        color: C.text, outline: 'none',
                                        background: '#F8FAFC', boxSizing: 'border-box',
                                        transition: 'all 0.2s', fontFamily: font,
                                    }}
                                    onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.background = C.white; }}
                                    onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.background = '#F8FAFC'; }}
                                />
                                <div onClick={() => setShowPass(!showPass)} style={{
                                    position: 'absolute', right: '14px', top: '50%',
                                    transform: 'translateY(-50%)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    {showPass ? (
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                            <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke={C.muted} strokeWidth="1.4"/>
                                            <circle cx="10" cy="10" r="2.5" stroke={C.muted} strokeWidth="1.4"/>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                            <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke={C.muted} strokeWidth="1.4"/>
                                            <circle cx="10" cy="10" r="2.5" stroke={C.muted} strokeWidth="1.4"/>
                                            <path d="M3 17L17 3" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Se souvenir + Mot de passe oublié */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={e => setRemember(e.target.checked)}
                                    style={{ accentColor: C.blue, width: '16px', height: '16px' }}
                                />
                                <span style={{ fontSize: '13px', color: C.text }}>Se souvenir de moi</span>
                            </label>
                            <span style={{ fontSize: '13px', color: C.blue, cursor: 'pointer', fontWeight: '500' }}>
                                Mot de passe oublié ?
                            </span>
                        </div>

                        {/* Erreur */}
                        {error && (
                            <div style={{
                                background: '#FEF2F2', border: '1px solid #FECACA',
                                borderRadius: '10px', padding: '0.7rem 1rem',
                                fontSize: '13px', color: C.error,
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Bouton */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '1rem',
                            background: loading ? C.muted : `linear-gradient(135deg, ${C.blueDark}, ${C.blue})`,
                            color: C.white, border: 'none',
                            borderRadius: '15px', fontSize: '16px',
                            fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 6px 20px rgba(59,130,246,0.4)',
                            transition: 'all 0.2s', fontFamily: font,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px',
                        }}>
                            {loading ? 'Connexion...' : (
                                <>
                                    Se connecter
                                   
                                </>
                            )}
                        </button>
                    </form>

                    {/* Séparateur "ou" */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        margin: '1.5rem 0',
                    }}>
                        <div style={{ flex: 1, height: '1px', background: C.border }}/>
                        <span style={{ fontSize: '13px', color: C.muted }}>ou</span>
                        <div style={{ flex: 1, height: '1px', background: C.border }}/>
                    </div>

                    {/* Créer un compte */}
                    <div style={{ textAlign: 'center', fontSize: '13px', color: C.muted }}>
                        Pas encore de compte ?{' '}
                        <span style={{ color: C.blue, fontWeight: '600', cursor: 'pointer' }}>
                            Créer un compte
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}