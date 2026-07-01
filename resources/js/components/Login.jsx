import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

/* ── Icônes SVG ─────────────────────────────────────────── */

function IcoLogo() {
    return (
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <defs>
                <linearGradient id="logo-g" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#93C5FD" />
                    <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="19" height="19" rx="5.5" fill="none" stroke="url(#logo-g)" strokeWidth="2.8" />
            <rect x="15" y="15" width="19" height="19" rx="5.5" fill="none" stroke="url(#logo-g)" strokeWidth="2.8" />
        </svg>
    )
}

function IcoEmail() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="3" width="13" height="9" rx="2" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M1 5l6.5 4L14 5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    )
}

function IcoMotDePasse() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="2" y="7" width="11" height="7" rx="2" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M5 7V5a2.5 2.5 0 015 0v2" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    )
}

function IcoCadenas() {
    return (
        <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
            <rect x="2" y="6" width="9" height="6" rx="1.5" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M4.5 6V4a2 2 0 014 0v2" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    )
}

function IcoCheck() {
    return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function IcoErreur() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="6.5" stroke="#B91C1C" strokeWidth="1.2" />
            <path d="M7 4.5v3" stroke="#B91C1C" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="7" cy="9.5" r="0.7" fill="#B91C1C" />
        </svg>
    )
}

/* ── Page Connexion ──────────────────────────────────────── */

export default function Connexion() {
    const { role } = useParams()
    const navigate = useNavigate()

    const [email, setEmail]               = useState('')
    const [motDePasse, setMotDePasse]     = useState('')
    const [erreur, setErreur]             = useState('')
    const [chargement, setChargement]     = useState(false)

    const estAdmin = role === 'admin'

    const seConnecter = async (e) => {
        e.preventDefault()
        setChargement(true)
        setErreur('')
        try {
            const res = await axios.post('/api/login', { email, password: motDePasse })
            const { token, user } = res.data
            if (user.role !== role) {
                setErreur('Accès refusé — mauvais portail.')
                setChargement(false)
                return
            }
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard')
        } catch {
            setErreur('Email ou mot de passe incorrect.')
            setChargement(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">

                {/* ══ GAUCHE — Formulaire ══ */}
                <div className="login-left">

                    {/* Logo */}
                    <div className="login-logo" onClick={() => navigate('/')}>
                        <div className="login-logo-icon"><IcoLogo /></div>
                        <span className="login-logo-name">CARDFLOW</span>
                    </div>

                    {/* Titre */}
                    <h1 className="login-titre">
                        {estAdmin ? 'Portail\nAdministrateur' : 'Portail Client'}
                    </h1>
                    <p className="login-sous-titre">
                        Connectez-vous pour accéder à votre espace bancaire sécurisé.
                    </p>

                    {/* Formulaire */}
                    <form className="login-form" onSubmit={seConnecter}>

                        <div className="champ">
                            <label>Adresse e-mail</label>
                            <div className="champ-input">
                                <span className="champ-ico"><IcoEmail /></span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={estAdmin ? 'admin@cardflow.com' : 'client@cardflow.com'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="champ">
                            <label>Mot de passe</label>
                            <div className="champ-input">
                                <span className="champ-ico"><IcoMotDePasse /></span>
                                <input
                                    type="password"
                                    value={motDePasse}
                                    onChange={e => setMotDePasse(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {erreur && (
                            <div className="erreur">
                                <IcoErreur /> {erreur}
                            </div>
                        )}

                        <button type="submit" className="login-btn" disabled={chargement}>
                            {chargement ? 'Connexion en cours…' : 'Se connecter →'}
                        </button>
                    </form>

                    <div className="login-retour">
                        <span onClick={() => navigate('/')}>← Retour à l'accueil</span>
                    </div>

                    {/* Footer */}
                    <div className="login-footer-gauche">
                        <IcoCadenas /> Connexion sécurisée · HPS Worldwide · 2026
                    </div>
                </div>

                {/* ══ DROITE — Visuel ══ */}
                <div className="login-right">
                    <h2 className="login-right-titre">
                        {estAdmin
                            ? 'Gérez votre plateforme bancaire en toute sécurité.'
                            : 'Vos cartes bancaires, vos transactions, à portée de main.'}
                    </h2>
                    <p className="login-right-sous-titre">
                        {estAdmin
                            ? 'Accédez au tableau de bord, gérez les cartes clients et surveillez les alertes de fraude en temps réel.'
                            : 'Consultez vos cartes, simulez des paiements et suivez votre historique de transactions.'}
                    </p>

                    {/* Zone image — à remplacer par votre image */}
                    <div className="login-image">
                        <div className="login-image-placeholder">
                            Image à venir
                        </div>
                    </div>

                    {/* Features */}
                    <div className="login-right-features">
                        {(estAdmin
                            ? ['Tableau de bord analytique', 'Gestion des cartes clients', 'Détection de fraude automatique']
                            : ['Mes cartes bancaires', 'Historique des transactions', 'Authentification 3DS / SMS']
                        ).map(f => (
                            <div key={f} className="login-right-feature">
                                <div className="feature-dot"><IcoCheck /></div>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
