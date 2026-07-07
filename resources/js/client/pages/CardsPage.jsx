import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, STATUS_STYLES } from '../../admin/theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function CardsPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [revealedId, setRevealedId] = useState(null)
    const [busyId, setBusyId] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/cards')
            setCards(res.data.data || res.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    const counts = {
        total: cards.length,
        active: cards.filter(c => c.statut === 'active').length,
        blocked: cards.filter(c => c.statut === 'blocked').length,
        limit: cards.reduce((s, c) => s + Number(c.plafond || 0), 0),
    }

    const toggle = async (card) => {
        setBusyId(card.id)
        try {
            const action = card.statut === 'active' ? 'block' : 'unblock'
            await api.patch(`/cards/${card.id}/${action}`)
            await load()
        } finally {
            setBusyId(null)
        }
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.cards.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('client.cards.subtitle')}</p>
                </div>
                <button className="ad-btn-outline" onClick={load}><Icon name="refresh" size={15} /> {t('common.refresh')}</button>
            </div>

            <div className="ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatCard label={t('client.cards.total')} value={loading ? '…' : counts.total} caption={t('client.cards.active_label', { count: counts.active })} />
                <StatCard label={t('client.cards.blocked')} value={loading ? '…' : counts.blocked} trend={counts.blocked > 0 ? { dir: 'down', text: `${counts.blocked}` } : null} />
                <StatCard label={t('client.cards.total_limit')} value={loading ? '…' : `${counts.limit.toLocaleString('fr-FR')} MAD`} caption={t('client.cards.cumulated_ceiling')} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.4rem', marginBottom: '1.25rem' }}>
                {cards.map(card => (
                    <div key={card.id} style={{ width: 320, flexShrink: 0 }}>
                        <div style={{
                            width: '100%', aspectRatio: '1.586 / 1', boxSizing: 'border-box',
                            borderRadius: 20, padding: '1.4rem', color: 'white', position: 'relative', overflow: 'hidden',
                            opacity: card.statut === 'blocked' ? 0.55 : 1,
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            background: card.type === 'visa'
                                ? `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`
                                : `linear-gradient(135deg, #2E3650, ${C.navy})`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>{card.statut === 'blocked' ? t('client.cards.blocked_card') : t('client.cards.virtual_card')}</span>
                                <span style={{ fontFamily: fontTitle, fontWeight: 800, fontSize: 15 }}>CardFlow</span>
                            </div>
                            <div style={{ fontSize: 18, letterSpacing: 2, fontWeight: 700, fontFamily: 'monospace' }}>
                                {revealedId === card.id ? card.pan : card.pan.replace(/\d(?=\d{4})/g, '•')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 10, opacity: 0.75, textTransform: 'uppercase' }}>{t('client.cards.valid_thru')}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{card.expiration ? new Date(card.expiration).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' }) : '—'}</div>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{card.type}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
                            <button
                                onClick={() => setRevealedId(revealedId === card.id ? null : card.id)}
                                className="ad-filter-btn"
                                style={{ flex: 1, justifyContent: 'center', padding: '0.55rem' }}
                            >
                                <Icon name={revealedId === card.id ? 'unlock' : 'lock'} size={13} /> {revealedId === card.id ? t('client.cards.hide') : t('client.cards.reveal')}
                            </button>
                            <button
                                disabled={busyId === card.id}
                                onClick={() => toggle(card)}
                                className="ad-filter-btn"
                                style={{ flex: 1, justifyContent: 'center', padding: '0.55rem' }}
                            >
                                <Icon name={card.statut === 'active' ? 'lock' : 'unlock'} size={13} />
                                {busyId === card.id ? '...' : card.statut === 'active' ? t('client.cards.lock') : t('client.cards.unlock')}
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && cards.length === 0 && (
                    <div className="ad-panel" style={{ textAlign: 'center', color: C.muted, width: '100%' }}>{t('client.cards.no_card')}</div>
                )}
            </div>

            <div className="ad-panel">
                <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>{t('client.cards.card_details')}</h2>
                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>{t('client.cards.number')}</th><th>{t('common.type')}</th><th>{t('client.cards.limit')}</th><th>{t('common.status')}</th><th>{t('client.cards.expiry')}</th></tr></thead>
                    <tbody>
                        {!loading && cards.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2rem 0' }}>{t('client.cards.no_card_found')}</td></tr>
                        )}
                        {cards.map(card => (
                            <tr key={card.id}>
                                <td style={{ fontFamily: 'monospace' }}>{card.pan}</td>
                                <td style={{ textTransform: 'capitalize' }}>{card.type}</td>
                                <td>{Number(card.plafond).toLocaleString('fr-FR')} MAD</td>
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[card.statut]?.bg, color: STATUS_STYLES[card.statut]?.color }}>
                                    {card.statut === 'active' ? t('client.cards.active') : card.statut === 'blocked' ? t('client.cards.blocked_status') : t('client.cards.expired_status')}
                                </span></td>
                                <td style={{ color: C.muted }}>{card.expiration ? new Date(card.expiration).toLocaleDateString('fr-FR') : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </>
    )
}
