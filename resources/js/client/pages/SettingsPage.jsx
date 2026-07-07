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
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState(null)

    const [notifPayments, setNotifPayments] = useState(true)
    const [notifPromos, setNotifPromos] = useState(false)
    const [twoFactor, setTwoFactor] = useState(true)

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMsg(null)
        try {
            const res = await api.patch('/me', { name, email })
            localStorage.setItem('user', JSON.stringify(res.data.user))
            setMsg({ type: 'success', key: 'client.settings.update_success' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message, key: 'client.settings.update_error' })
        } finally {
            setSaving(false)
        }
    }

    const prefs = [
        { label: t('client.settings.notif_payments'), desc: t('client.settings.notif_payments_desc'), state: notifPayments, setState: setNotifPayments },
        { label: t('client.settings.notif_promos'), desc: t('client.settings.notif_promos_desc'), state: notifPromos, setState: setNotifPromos },
        { label: t('client.settings.two_factor'), desc: t('client.settings.two_factor_desc'), state: twoFactor, setState: setTwoFactor },
    ]

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.settings.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('client.settings.subtitle')}</p>
                </div>
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('client.settings.profile_title')}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.4rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.teal, color: 'white', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {initialsOf(name) || 'CL'}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{name || 'Client'}</div>
                            <div style={{ fontSize: 13, color: C.muted }}>{t('client.settings.role')}</div>
                        </div>
                    </div>

                    <form onSubmit={handleSave}>
                        <label className="ad-form-label">{t('client.settings.full_name')}</label>
                        <input className="ad-form-input" value={name} onChange={e => setName(e.target.value)} required />

                        <label className="ad-form-label">{t('client.settings.email_address')}</label>
                        <input className="ad-form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                        {msg && (
                            <div className="ad-alert-banner" style={{
                                marginTop: '1rem',
                                background: msg.type === 'success' ? C.greenBg : C.redBg,
                                color: msg.type === 'success' ? C.green : C.red,
                            }}>
                                <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                {msg.text || t(msg.key)}
                            </div>
                        )}

                        <button className="ad-issue-btn" type="submit" disabled={saving}>
                            {saving ? t('client.settings.saving') : t('client.settings.save_changes')}
                        </button>
                    </form>
                </div>

                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('client.settings.prefs_title')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {prefs.map(pref => (
                            <div key={pref.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: '1.1rem', borderBottom: `1px solid ${C.border}` }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{pref.label}</div>
                                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{pref.desc}</div>
                                </div>
                                <button type="button" className={`ad-toggle ${pref.state ? 'on' : 'off'}`} onClick={() => pref.setState(v => !v)} />
                            </div>
                        ))}
                        <div style={{ fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="shield" size={14} /> {t('client.settings.local_pref')}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
