import React, { useState } from 'react'
import axios from 'axios'
import bgImage from '../assets/cardflow-bg.png'
import loginBg from '../assets/login-bg.png'

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
    const [mode,     setMode]      = useState('login') // 'login' | 'signup'
    const [name,     setName]      = useState('')
    const [email,    setEmail]     = useState('')
    const [password, setPassword]  = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPass, setShowPass]  = useState(false)
    const [remember, setRemember]  = useState(false)
    const [error,    setError]     = useState('')
    const [loading,  setLoading]   = useState(false)

    const isSignup = mode === 'signup'

    const switchMode = (next) => {
        setMode(next)
        setError('')
        setPassword('')
        setConfirmPassword('')
    }

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

    const handleSignup = async (e) => {
        e.preventDefault()
        setError('')
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        setLoading(true)
        try {
            const res = await axios.post('/api/register', { name, email, password })
            const { token, user } = res.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            window.location.href = '/client/dashboard'
        } catch (err) {
            const message = err.response?.data?.message
                || Object.values(err.response?.data?.errors || {})[0]?.[0]
                || 'Impossible de créer le compte.'
            setError(message)
            setLoading(false)
        }
    }

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

            * { box-sizing: border-box; }

            html, body { margin: 0; height: 100%; overflow: hidden; }

            .cf-shell {
                display: flex;
                height: 100vh;
                width: 100vw;
                font-family: ${font};
                background-image: url(${loginBg});
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                overflow: hidden;
                position: relative;
            }

            .cf-col {
                flex: 1 1 50%;
                width: 50%;
                min-width: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .cf-left {
                overflow: hidden;
                padding: 0px;
            }

            .cf-blob {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                filter: blur(2px);
            }


            .cf-img-wrap {
                position: relative;
                width: 115%;
                height: 115%;
                max-width: 1600px;
                max-height: 1600px;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: cfFloat 6s ease-in-out infinite;
            }

            @keyframes cfFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }

            .cf-img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 25px 45px rgba(26,58,107,0.18));
            }

            .cf-card {
                background: rgba(255,255,255,0.72);
                backdrop-filter: blur(20px) saturate(160%);
                -webkit-backdrop-filter: blur(20px) saturate(160%);
                border-radius: 28px;
                padding: 2.6rem 3.25rem;
                width: 100%;
                max-width: 540px;
                box-shadow: 0 20px 60px rgba(26,58,107,0.10), 0 2px 8px rgba(26,58,107,0.06), inset 0 1px 0 rgba(255,255,255,0.6);
                border: 1px solid rgba(255,255,255,0.5);
                animation: cfRise 0.7s cubic-bezier(0.16,1,0.3,1) both;
            }

            .cf-right-wrap {
                width: 100%;
                max-width: 540px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .cf-footer {
                margin-top: 1.25rem;
                text-align: center;
                font-size: 13px;
                color: ${C.muted};
            }

            @keyframes cfRise {
                from { opacity: 0; transform: translateY(24px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }

            .cf-fade {
                opacity: 0;
                animation: cfFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
            }
            .cf-d1 { animation-delay: 0.08s; }
            .cf-d2 { animation-delay: 0.14s; }
            .cf-d3 { animation-delay: 0.20s; }
            .cf-d4 { animation-delay: 0.26s; }
            .cf-d5 { animation-delay: 0.32s; }
            .cf-d6 { animation-delay: 0.38s; }

            @keyframes cfFadeUp {
                from { opacity: 0; transform: translateY(10px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .cf-icon {
                width: 52px; height: 52px;
                background: linear-gradient(135deg, #EEF2FF, #DCE4FF);
                border-radius: 16px;
                display: flex; align-items: center; justify-content: center;
                margin-bottom: 1.5rem;
                box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(26,58,107,0.08);
            }

            .cf-field { position: relative; }

            .cf-field svg { transition: stroke 0.2s ease; }

            .cf-input {
                width: 100%;
                padding: 0.9rem 1rem 0.9rem 2.9rem;
                border: 1.5px solid ${C.border};
                border-radius: 13px;
                font-size: 15px;
                color: ${C.text};
                outline: none;
                background: rgba(248,250,252,0.8);
                transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, transform 0.15s ease;
                font-family: ${font};
            }

            .cf-input:focus {
                border-color: ${C.blue};
                background: ${C.white};
                box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
                transform: translateY(-1px);
            }

            .cf-input:focus + .cf-eye svg,
            .cf-field:focus-within svg.cf-lead {
                stroke: ${C.blue};
            }

            .cf-eye { transition: transform 0.15s ease, opacity 0.15s ease; opacity: 0.85; }
            .cf-eye:hover { opacity: 1; transform: translateY(-50%) scale(1.08); }

            .cf-forgot { transition: opacity 0.15s ease; }
            .cf-forgot:hover { opacity: 0.7; }

            .cf-btn {
                width: 100%;
                padding: 1rem;
                background: linear-gradient(135deg, ${C.navy} 0%, ${C.blueDark} 55%, ${C.blue} 100%);
                background-size: 160% 160%;
                background-position: 0% 50%;
                color: ${C.white};
                border: none;
                border-radius: 13px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(26,58,107,0.28), 0 2px 6px rgba(26,58,107,0.15);
                transition: background-position 0.4s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
                font-family: ${font};
                display: flex; align-items: center; justify-content: center; gap: 8px;
                letter-spacing: 0.3px;
            }

            .cf-btn:hover:not(:disabled) {
                background-position: 100% 50%;
                transform: translateY(-2px);
                box-shadow: 0 14px 32px rgba(26,58,107,0.36), 0 4px 10px rgba(26,58,107,0.2);
            }

            .cf-btn:active:not(:disabled) {
                transform: translateY(0px) scale(0.99);
                box-shadow: 0 6px 16px rgba(26,58,107,0.3);
            }

            .cf-btn:disabled {
                background: ${C.muted};
                cursor: not-allowed;
                box-shadow: none;
            }

            .cf-signup { transition: opacity 0.15s ease; }
            .cf-signup:hover { opacity: 0.75; }

            .cf-check { accent-color: ${C.blue}; width: 16px; height: 16px; cursor: pointer; }

            @media (max-width: 980px) {
                .cf-shell { flex-direction: column; }
                .cf-col { flex: none; width: 100%; }
                .cf-left { padding: 28px; min-height: 260px; max-height: 320px; }
                .cf-img-wrap { max-width: 360px; max-height: 260px; }
                .cf-card { max-width: 480px; margin: 0 auto; }
            }

            @media (max-width: 560px) {
                .cf-left { display: none; }
                .cf-col.cf-right { padding: 1.25rem; }
                .cf-card { padding: 2rem 1.5rem; border-radius: 22px; }
            }
        `}</style>
        <div className="cf-shell">

            {/* ══════ GAUCHE — Illustration CardFlow ══════ */}
            <div className="cf-col cf-left">
                <div className="cf-blob" style={{
                    top: '-140px', left: '-140px',
                    width: '520px', height: '520px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)',
                }}/>
                <div className="cf-blob" style={{
                    bottom: '-100px', right: '-60px',
                    width: '380px', height: '380px',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.09), transparent 70%)',
                }}/>
                <div className="cf-blob" style={{
                    top: '40%', right: '10%',
                    width: '160px', height: '160px',
                    background: 'radial-gradient(circle, rgba(26,58,107,0.06), transparent 70%)',
                }}/>

                <div className="cf-img-wrap">
                    <img src={bgImage} alt="CardFlow" className="cf-img" />
                </div>
            </div>

            {/* ══════ DROITE — Formulaire ══════ */}
            <div className="cf-col cf-right" style={{ padding: '2rem' }}>
              <div className="cf-right-wrap">
                <div className="cf-card">

                    {/* Icône cadenas */}
                    <div className="cf-icon cf-fade cf-d1">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="11" width="18" height="11" rx="3" stroke={C.navy} strokeWidth="1.8"/>
                            <path d="M7 11V7a5 5 0 0110 0v4" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round"/>
                            <circle cx="12" cy="16.5" r="1.5" fill={C.navy}/>
                        </svg>
                    </div>

                    {/* Titre */}
                    <h1 className="cf-fade cf-d2" style={{
                        fontFamily: fontTitle,
                        fontSize: '32px',
                        fontWeight: '800',
                        color: C.navy,
                        margin: '0 0 6px',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                    }}>
                        {isSignup ? 'Créer un compte' : 'Bienvenue'}
                    </h1>
                    <p className="cf-fade cf-d2" style={{
                        fontSize: '15px',
                        color: C.muted,
                        margin: '0 0 1.8rem',
                        lineHeight: '1.6',
                    }}>
                        {isSignup
                            ? 'Créez votre espace CardFlow pour gérer vos finances.'
                            : 'Connectez-vous à votre espace CardFlow pour gérer vos finances.'}
                    </p>

                    {/* Formulaire */}
                    <form onSubmit={isSignup ? handleSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                        {/* Nom complet (inscription uniquement) */}
                        {isSignup && (
                            <div className="cf-fade cf-d3">
                                <label style={{ fontSize: '15px', fontWeight: '600', color: C.text, display: 'block', marginBottom: '6px' }}>
                                    Nom complet
                                </label>
                                <div className="cf-field">
                                    <svg className="cf-lead" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
                                        width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="2.8" stroke={C.muted} strokeWidth="1.3"/>
                                        <path d="M2.5 14c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round"/>
                                    </svg>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Prénom Nom"
                                        required
                                        className="cf-input"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="cf-fade cf-d3">
                            <label style={{ fontSize: '15px', fontWeight: '600', color: C.text, display: 'block', marginBottom: '6px' }}>
                                Adresse email
                            </label>
                            <div className="cf-field">
                                <svg className="cf-lead" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
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
                                    className="cf-input"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="cf-fade cf-d4">
                            <label style={{ fontSize: '15px', fontWeight: '600', color: C.text, display: 'block', marginBottom: '6px' }}>
                                Mot de passe
                            </label>
                            <div className="cf-field">
                                <svg className="cf-lead" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
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
                                    className="cf-input"
                                    style={{ paddingRight: '2.8rem' }}
                                />
                                <div onClick={() => setShowPass(!showPass)} className="cf-eye" style={{
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

                        {/* Confirmation du mot de passe (inscription uniquement) */}
                        {isSignup && (
                            <div className="cf-fade cf-d5">
                                <label style={{ fontSize: '15px', fontWeight: '600', color: C.text, display: 'block', marginBottom: '6px' }}>
                                    Confirmer le mot de passe
                                </label>
                                <div className="cf-field">
                                    <svg className="cf-lead" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
                                        width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <rect x="2" y="7.5" width="12" height="7" rx="2" stroke={C.muted} strokeWidth="1.3"/>
                                        <path d="M5 7.5V5a3 3 0 016 0v2.5" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round"/>
                                    </svg>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••••"
                                        required
                                        className="cf-input"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Se souvenir + Mot de passe oublié (connexion uniquement) */}
                        {!isSignup && (
                            <div className="cf-fade cf-d5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={e => setRemember(e.target.checked)}
                                        className="cf-check"
                                    />
                                    <span style={{ fontSize: '15px', color: C.text }}>Se souvenir de moi</span>
                                </label>
                                <span className="cf-forgot" style={{ fontSize: '15px', color: C.blue, cursor: 'pointer', fontWeight: '500' }}>
                                    Mot de passe oublié ?
                                </span>
                            </div>
                        )}

                        {/* Erreur */}
                        {error && (
                            <div style={{
                                background: '#FEF2F2', border: '1px solid #FECACA',
                                borderRadius: '10px', padding: '0.7rem 1rem',
                                fontSize: '15px', color: C.error,
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Bouton */}
                        <button type="submit" disabled={loading} className="cf-btn cf-fade cf-d6">
                            {loading
                                ? (isSignup ? 'Création...' : 'Connexion...')
                                : (isSignup ? 'Créer mon compte' : 'Se connecter')}
                        </button>
                    </form>

                    {/* Séparateur "ou" */}
                    <div className="cf-fade cf-d6" style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        margin: '1.5rem 0',
                    }}>
                        <div style={{ flex: 1, height: '1px', background: C.border }}/>
                        <span style={{ fontSize: '15px', color: C.muted }}>ou</span>
                        <div style={{ flex: 1, height: '1px', background: C.border }}/>
                    </div>

                    {/* Créer un compte / Retour connexion */}
                    <div className="cf-fade cf-d6" style={{ textAlign: 'center', fontSize: '15px', color: C.muted }}>
                        {isSignup ? (
                            <>
                                Déjà un compte ?{' '}
                                <span className="cf-signup" style={{ color: C.blue, fontWeight: '600', cursor: 'pointer' }} onClick={() => switchMode('login')}>
                                    Se connecter
                                </span>
                            </>
                        ) : (
                            <>
                                Pas encore de compte ?{' '}
                                <span className="cf-signup" style={{ color: C.blue, fontWeight: '600', cursor: 'pointer' }} onClick={() => switchMode('signup')}>
                                    Créer un compte
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="cf-footer cf-fade cf-d6">
                    Vos données sont protégées et chiffrées de bout en bout.
                </div>
              </div>
            </div>
        </div>
        </>
    )
}
