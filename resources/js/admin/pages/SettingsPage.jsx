import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function SettingsPage() {
    const { admin } = useOutletContext()
    const api = useApi()
    const { t } = useLanguage()
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
            setMsg({ type: 'success', key: 'admin.settings.update_success' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message, key: 'admin.settings.update_error' })
        } finally {
            setSaving(false)
        }
    }

    const prefs = [
        { icon: 'shield', label: t('admin.settings.notif_fraud'), desc: t('admin.settings.notif_fraud_desc'), state: notifFraud, setState: setNotifFraud },
        { icon: 'file', label: t('admin.settings.notif_weekly'), desc: t('admin.settings.notif_weekly_desc'), state: notifWeekly, setState: setNotifWeekly },
        { icon: 'lock', label: t('admin.settings.two_factor'), desc: t('admin.settings.two_factor_desc'), state: twoFactor, setState: setTwoFactor },
    ]

    // Badge d'icône neutre — un seul style monochrome partout, pas de code couleur par item
    const iconBadge = (name, size = 16) => (
        <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon name={name} size={size} color={C.muted} />
        </div>
    )

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.settings.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('admin.settings.subtitle')}</p>
                </div>
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.settings.profile_title')}</h2>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.3rem',
                        padding: '0.8rem 1rem', borderRadius: 12, background: C.bg,
                    }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.navy, color: 'white', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {initialsOf(name) || 'AD'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{name || 'Administrateur'}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{t('admin.settings.role')}</div>
                        </div>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {iconBadge('user')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <label className="ad-form-label" style={{ margin: '0 0 4px', fontSize: 13 }}>{t('admin.settings.full_name')}</label>
                                <input className="ad-form-input" style={{ margin: 0 }} value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {iconBadge('mail')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <label className="ad-form-label" style={{ margin: '0 0 4px', fontSize: 13 }}>{t('admin.settings.email_address')}</label>
                                <input className="ad-form-input" style={{ margin: 0 }} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        {msg && (
                            <div className="ad-alert-banner" style={{
                                background: msg.type === 'success' ? C.greenBg : C.redBg,
                                color: msg.type === 'success' ? C.green : C.red,
                            }}>
                                <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                {msg.text || t(msg.key)}
                            </div>
                        )}

                        <button className="ad-issue-btn" type="submit" disabled={saving} style={{ marginTop: 'auto' }}>
                            {saving ? t('common.saving') : t('common.save')}
                        </button>
                    </form>
                </div>

                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.settings.prefs_title')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {prefs.map(pref => (
                            <div key={pref.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, paddingBottom: '0.9rem', borderBottom: `1px solid ${C.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    {iconBadge(pref.icon)}
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{pref.label}</div>
                                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{pref.desc}</div>
                                    </div>
                                </div>
                                <button type="button" className={`ad-toggle ${pref.state ? 'on' : 'off'}`} onClick={() => pref.setState(v => !v)} style={{ marginTop: 2 }} />
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.1rem' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: '0.7rem' }}>
                            {t('admin.settings.session_title')}
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '0.8rem 1rem', borderRadius: 12, background: C.bg,
                        }}>
                            {iconBadge('shield')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t('admin.settings.session_device')}</div>
                                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{t('admin.settings.session_now')}</div>
                            </div>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: '0.6rem', lineHeight: 1.5 }}>
                            {t('admin.settings.local_pref')}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
