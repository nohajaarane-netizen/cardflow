import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, STATUS_STYLES, PAGE_SIZE } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function CardsPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [page, setPage] = useState(1)
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

    const filtered = useMemo(() => cards
        .filter(c => (c.user?.name || '').toLowerCase().includes(search.toLowerCase()) || c.pan.includes(search))
        .filter(c => statusFilter === 'all' || c.statut === statusFilter)
        .filter(c => typeFilter === 'all' || c.type === typeFilter),
    [cards, search, statusFilter, typeFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const pageCards = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => { setPage(1) }, [search, statusFilter, typeFilter])

    const counts = {
        total: cards.length,
        active: cards.filter(c => c.statut === 'active').length,
        blocked: cards.filter(c => c.statut === 'blocked').length,
        expired: cards.filter(c => c.statut === 'expired').length,
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
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.cards.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('admin.cards.subtitle')}</p>
                </div>
            </div>

            <div className="ad-stats">
                <StatCard label={t('admin.cards.total')} value={loading ? '…' : counts.total} caption={t('admin.dashboard.active_count', { count: counts.active })} />
                <StatCard label={t('admin.cards.active')} value={loading ? '…' : counts.active} trend={{ dir: 'up', text: `${Math.round((counts.active / (counts.total || 1)) * 100)}%` }} />
                <StatCard label={t('admin.cards.blocked')} value={loading ? '…' : counts.blocked} trend={counts.blocked > 0 ? { dir: 'down', text: `${counts.blocked}` } : null} />
                <StatCard label={t('admin.cards.expired')} value={loading ? '…' : counts.expired} caption={t('admin.cards.renew')} />
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div className="ad-search">
                        <Icon name="search" size={16} />
                        <input placeholder={t('admin.cards.search')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">{t('admin.cards.all_status')}</option>
                        <option value="active">{t('admin.dashboard.active_status')}</option>
                        <option value="blocked">{t('admin.dashboard.blocked_status')}</option>
                        <option value="expired">{t('admin.dashboard.expired_status')}</option>
                    </select>
                    <select className="ad-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="all">{t('admin.cards.all_types')}</option>
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                    </select>
                    <button className="ad-btn-outline" style={{ marginLeft: 'auto' }} onClick={load}><Icon name="refresh" size={15} /> {t('common.refresh')}</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>{t('admin.cards.number')}</th><th>{t('admin.cards.holder')}</th><th>{t('common.type')}</th><th>{t('admin.cards.limit')}</th><th>{t('common.status')}</th><th>{t('admin.cards.expiry')}</th><th></th></tr></thead>
                    <tbody>
                        {!loading && pageCards.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>{t('admin.cards.no_card_found')}</td></tr>
                        )}
                        {pageCards.map(card => (
                            <tr key={card.id}>
                                <td style={{ fontFamily: 'monospace' }}>{card.pan}</td>
                                <td style={{ fontWeight: 600 }}>{card.user?.name || '—'}</td>
                                <td style={{ textTransform: 'capitalize' }}>{card.type}</td>
                                <td>{Number(card.plafond).toLocaleString('fr-FR')} MAD</td>
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[card.statut].bg, color: STATUS_STYLES[card.statut].color }}>
                                    {card.statut === 'active' ? t('admin.dashboard.active_status') : card.statut === 'blocked' ? t('admin.dashboard.blocked_status') : t('admin.dashboard.expired_status')}
                                </span></td>
                                <td style={{ color: C.muted }}>{card.expiration ? new Date(card.expiration).toLocaleDateString('fr-FR') : '—'}</td>
                                <td>
                                    <button
                                        className="ad-filter-btn"
                                        disabled={busyId === card.id || card.statut === 'expired'}
                                        style={{ padding: '0.4rem 0.8rem', fontSize: 12.5, opacity: card.statut === 'expired' ? 0.4 : 1 }}
                                        onClick={() => toggle(card)}
                                    >
                                        <Icon name={card.statut === 'active' ? 'lock' : 'unlock'} size={13} />
                                        {busyId === card.id ? '...' : card.statut === 'active' ? t('admin.dashboard.block') : t('admin.dashboard.unblock')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                <div className="ad-pagination">
                    <span style={{ fontSize: 13.5, color: C.muted }}>
                        {t('common.showing', { from: filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtered.length), total: filtered.length, label: t('admin.cards.cards_label') })}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="ad-page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><Icon name="arrowLeft" size={14} color={C.text} /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button key={n} className={`ad-page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                        ))}
                        <button className="ad-page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><Icon name="arrowRight" size={14} color={C.text} /></button>
                    </div>
                </div>
            </div>
        </>
    )
}
