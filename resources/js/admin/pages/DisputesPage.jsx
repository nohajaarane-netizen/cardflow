import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { C, fontTitle, Icon, useApi, STATUS_STYLES } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

const TYPE_ICON = { fraud: 'shield', blocked: 'lock', expiration: 'close' }

export default function DisputesPage() {
    const { refreshBadge } = useOutletContext()
    const api = useApi()
    const { t } = useLanguage()
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/alerts')
            setAlerts(res.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    const filtered = useMemo(() => alerts.filter(a => filter === 'all' || (filter === 'unread' ? !a.lue : a.type === filter)), [alerts, filter])

    const markRead = async (id) => {
        await api.patch(`/alerts/${id}/read`)
        await load()
        refreshBadge()
    }

    const unreadCount = alerts.filter(a => !a.lue).length

    const TYPE_LABELS = { fraud: t('admin.disputes.type_fraud'), blocked: t('admin.disputes.type_blocked'), expiration: t('admin.disputes.type_expiration') }

    const TABS = [
        { key: 'all', label: t('admin.disputes.tab_all') },
        { key: 'unread', label: t('admin.disputes.tab_unread') },
        { key: 'fraud', label: t('admin.disputes.tab_fraud') },
        { key: 'blocked', label: t('admin.disputes.tab_blocked') },
        { key: 'expiration', label: t('admin.disputes.tab_expiration') },
    ]

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.disputes.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>
                        {unreadCount > 0 ? t('admin.disputes.unread_needs_attention', { count: unreadCount }) : t('admin.disputes.all_handled')}
                    </p>
                </div>
                <div className="ad-tabs">
                    {TABS.map(tab => (
                        <button key={tab.key} className={`ad-tab ${filter === tab.key ? 'active' : ''}`} onClick={() => setFilter(tab.key)}>{tab.label}</button>
                    ))}
                </div>
            </div>

            <div className="ad-panel">
                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', color: C.muted, padding: '3rem 0' }}>
                        <Icon name="shield" size={32} color={C.border} />
                        <div style={{ marginTop: 10 }}>{t('admin.disputes.no_alert')}</div>
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filtered.map(a => (
                        <div key={a.id} style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 0.5rem',
                            borderBottom: `1px solid ${C.border}`, background: a.lue ? 'transparent' : '#F8FBFF',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: STATUS_STYLES[a.type]?.bg || C.amberBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon name={TYPE_ICON[a.type] || 'shield'} color={STATUS_STYLES[a.type]?.color || C.amber} size={19} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                    <span style={{ fontWeight: 700, color: C.text, fontSize: 14.5 }}>{TYPE_LABELS[a.type] || a.type}</span>
                                    {!a.lue && <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blueDark }} />}
                                </div>
                                <div style={{ fontSize: 13.5, color: C.muted }}>{a.message}</div>
                                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
                                    {a.client?.name} · {a.card?.pan} · {new Date(a.created_at).toLocaleString('fr-FR')}
                                </div>
                            </div>
                            {!a.lue && (
                                <button className="ad-btn-outline" onClick={() => markRead(a.id)}>
                                    <Icon name="check" size={14} /> {t('admin.disputes.mark_read')}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
