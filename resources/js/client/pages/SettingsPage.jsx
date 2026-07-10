import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi } from '../../admin/theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function SettingsPage() {
    const { user } = useOutletContext()
    const api = useApi()
    const { t } = useLanguage()
    const [name, setName] = useState(user.name || '')
    const [email, setEmail] = useState(user.email || '')
    const [telephone, setTelephone] = useState(user.telephone || '')
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState(null)

    const [notifPayments, setNotifPayments] = useState(true)
    const [notifPromos, setNotifPromos] = useState(false)
    const [twoFactor, setTwoFactor] = useState(true)
    const [loginAlerts, setLoginAlerts] = useState(true)

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMsg(null)
        try {
            const res = await api.patch('/me', { name, email, telephone })
            localStorage.setItem('user', JSON.stringify(res.data.user))
            setMsg({ type: 'success', key: 'client.settings.update_success' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message, key: 'client.settings.update_error' })
        } finally {
            setSaving(false)
        }
    }

    const prefs = [
        { icon: 'mail', label: t('client.settings.notif_payments'), desc: t('client.settings.notif_payments_desc'), state: notifPayments, setState: setNotifPayments },
        { icon: 'bell', label: t('client.settings.notif_promos'), desc: t('client.settings.notif_promos_desc'), state: notifPromos, setState: setNotifPromos },
        { icon: 'lock', label: t('client.settings.two_factor'), desc: t('client.settings.two_factor_desc'), state: twoFactor, setState: setTwoFactor },
        { icon: 'eye', label: t('client.settings.login_alerts'), desc: t('client.settings.login_alerts_desc'), state: loginAlerts, setState: setLoginAlerts },
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
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.settings.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('client.settings.subtitle')}</p>
                </div>
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('client.settings.profile_title')}</h2>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.3rem',
                        padding: '0.8rem 1rem', borderRadius: 12, background: C.bg,
                    }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.navy, color: 'white', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {initialsOf(name) || 'CL'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{name || 'Client'}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{t('client.settings.role')}</div>
                        </div>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {iconBadge('user')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <label className="ad-form-label" style={{ margin: '0 0 4px', fontSize: 13 }}>{t('client.settings.full_name')}</label>
                                <input className="ad-form-input" style={{ margin: 0 }} value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {iconBadge('mail')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <label className="ad-form-label" style={{ margin: '0 0 4px', fontSize: 13 }}>{t('client.settings.email_address')}</label>
                                <input className="ad-form-input" style={{ margin: 0 }} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {iconBadge('phone')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <label className="ad-form-label" style={{ margin: '0 0 4px', fontSize: 13 }}>{t('client.settings.phone_number')}</label>
                                <input
                                    className="ad-form-input"
                                    style={{ margin: 0 }}
                                    type="tel"
                                    value={telephone}
                                    onChange={e => setTelephone(e.target.value)}
                                    placeholder="+212612345678"
                                    pattern="^\+212[5-7][0-9]{8}$"
                                    title="Format attendu : +212 suivi de 9 chiffres (ex: +212612345678)"
                                    required
                                />
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
                            {saving ? t('client.settings.saving') : t('client.settings.save_changes')}
                        </button>
                    </form>
                </div>

                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('client.settings.prefs_title')}</h2>
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
                            {t('client.settings.session_title')}
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '0.8rem 1rem', borderRadius: 12, background: C.bg,
                        }}>
                            {iconBadge('shield')}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t('client.settings.session_device')}</div>
                                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{t('client.settings.session_now')}</div>
                            </div>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: '0.6rem', lineHeight: 1.5 }}>
                            {t('client.settings.local_pref')}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
