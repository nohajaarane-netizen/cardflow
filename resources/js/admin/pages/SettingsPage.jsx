import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi } from '../theme'

export default function SettingsPage() {
    const { admin } = useOutletContext()
    const api = useApi()
    const [name, setName] = useState(admin.name || '')
    const [email, setEmail] = useState(admin.email || '')
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState(null)

    const [notifFraud, setNotifFraud] = useState(true)
    const [notifWeekly, setNotifWeekly] = useState(false)
    const [twoFactor, setTwoFactor] = useState(true)

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMsg(null)
        try {
            const res = await api.patch('/me', { name, email })
            localStorage.setItem('user', JSON.stringify(res.data.user))
            setMsg({ type: 'success', text: 'Profil mis à jour avec succès.' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Paramètres</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Gérez votre profil administrateur et vos préférences.</p>
                </div>
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Profil administrateur</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.4rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.teal, color: 'white', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {initialsOf(name) || 'AD'}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{name || 'Administrateur'}</div>
                            <div style={{ fontSize: 13, color: C.muted }}>Super Administrateur</div>
                        </div>
                    </div>

                    <form onSubmit={handleSave}>
                        <label className="ad-form-label">Nom complet</label>
                        <input className="ad-form-input" value={name} onChange={e => setName(e.target.value)} required />

                        <label className="ad-form-label">Adresse email</label>
                        <input className="ad-form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                        {msg && (
                            <div className="ad-alert-banner" style={{
                                marginTop: '1rem',
                                background: msg.type === 'success' ? C.greenBg : C.redBg,
                                color: msg.type === 'success' ? C.green : C.red,
                            }}>
                                <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                {msg.text}
                            </div>
                        )}

                        <button className="ad-issue-btn" type="submit" disabled={saving}>
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </form>
                </div>

                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Préférences &amp; sécurité</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {[
                            { label: 'Alertes de fraude par email', desc: 'Recevoir un email immédiat lors d\'une transaction suspecte.', state: notifFraud, setState: setNotifFraud },
                            { label: 'Résumé hebdomadaire', desc: 'Recevoir un rapport chaque lundi matin.', state: notifWeekly, setState: setNotifWeekly },
                            { label: 'Authentification à deux facteurs', desc: 'Exiger un code OTP à chaque connexion admin.', state: twoFactor, setState: setTwoFactor },
                        ].map(pref => (
                            <div key={pref.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: '1.1rem', borderBottom: `1px solid ${C.border}` }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{pref.label}</div>
                                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{pref.desc}</div>
                                </div>
                                <button type="button" className={`ad-toggle ${pref.state ? 'on' : 'off'}`} onClick={() => pref.setState(v => !v)} />
                            </div>
                        ))}
                        <div style={{ fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="shield" size={14} /> Ces préférences sont enregistrées localement pour cette session.
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
