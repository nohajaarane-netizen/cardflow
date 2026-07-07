import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { C, fontTitle, Icon, initialsOf, formatDate, useApi, STATUS_STYLES, PAGE_SIZE } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function ClientsPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [clients, setClients] = useState([])
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [onlyWithCards, setOnlyWithCards] = useState(false)
    const [sortBy, setSortBy] = useState('recent')
    const [page, setPage] = useState(1)
    const [expandedId, setExpandedId] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [u, c] = await Promise.all([api.get('/users'), api.get('/cards')])
            setClients(u.data)
            setCards(c.data.data || c.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    const cardsOf = (id) => cards.filter(c => c.user?.id === id)

    const filtered = useMemo(() => {
        let list = clients
            .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
            .filter(c => !onlyWithCards || c.cards_count > 0)
        list = [...list].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'cards') return b.cards_count - a.cards_count
            return new Date(b.created_at) - new Date(a.created_at)
        })
        return list
    }, [clients, search, onlyWithCards, sortBy])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const pageClients = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => { setPage(1) }, [search, onlyWithCards, sortBy])

    const toggleCardBlock = async (card) => {
        const action = card.statut === 'active' ? 'block' : 'unblock'
        await api.patch(`/cards/${card.id}/${action}`)
        await load()
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.clients.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>
                        {t('admin.clients.subtitle', { count: clients.length, s: clients.length > 1 ? 's' : '' })}
                    </p>
                </div>
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div className="ad-search">
                        <Icon name="search" size={16} />
                        <input placeholder={t('admin.dashboard.search_client')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="ad-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ appearance: 'none' }}>
                        <option value="recent">{t('admin.clients.sort_recent')}</option>
                        <option value="name">{t('admin.clients.sort_name')}</option>
                        <option value="cards">{t('admin.clients.sort_cards')}</option>
                    </select>
                    <div className={`ad-filter-btn ${onlyWithCards ? 'on' : ''}`} onClick={() => setOnlyWithCards(v => !v)}>
                        <Icon name="filter" size={15} color={onlyWithCards ? 'white' : C.muted} /> {t('admin.dashboard.only_with_cards')}
                    </div>
                    <button className="ad-btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>
                        <Icon name="refresh" size={15} /> {t('common.refresh')}
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>{t('admin.dashboard.client')}</th><th>{t('admin.clients.email')}</th><th>{t('admin.clients.cards')}</th><th>{t('common.status')}</th><th>{t('admin.clients.registration')}</th><th></th></tr></thead>
                    <tbody>
                        {!loading && pageClients.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>{t('admin.clients.no_client_found')}</td></tr>
                        )}
                        {pageClients.map(c => {
                            const status = c.cards_count > 0 ? 'Actif' : 'Nouveau'
                            const statusLabel = c.cards_count > 0 ? t('admin.clients.active') : t('admin.clients.new')
                            const isExpanded = expandedId === c.id
                            return (
                            <React.Fragment key={c.id}>
                            <tr>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.tealDark, color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {initialsOf(c.name)}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: C.muted }}>{c.email}</td>
                                <td>{c.cards_count}</td>
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[status].bg, color: STATUS_STYLES[status].color }}>{statusLabel}</span></td>
                                <td style={{ color: C.muted }}>{formatDate(c.created_at)}</td>
                                <td style={{ position: 'relative' }}>
                                    <button className="ad-icon-btn" onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}><Icon name="dots" /></button>
                                    {openMenuId === c.id && (
                                        <div className="ad-menu">
                                            <button className="ad-menu-item" onClick={() => { setExpandedId(isExpanded ? null : c.id); setOpenMenuId(null) }}>
                                                <Icon name="card" size={15} /> {isExpanded ? t('admin.dashboard.hide_cards') : t('admin.dashboard.view_cards')}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {isExpanded && (
                                <tr>
                                    <td colSpan={6} style={{ background: '#F8FAFC', padding: '0.9rem 1rem' }}>
                                        {cardsOf(c.id).length === 0 ? (
                                            <span style={{ color: C.muted, fontSize: 13.5 }}>{t('admin.clients.no_card')}</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {cardsOf(c.id).map(card => (
                                                    <div key={card.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
                                                        <span style={{ fontFamily: 'monospace' }}>{card.pan}</span>
                                                        <span style={{ textTransform: 'capitalize' }}>{card.type}</span>
                                                        <span>{Number(card.plafond).toLocaleString('fr-FR')} MAD</span>
                                                        <span className="ad-status-pill" style={{ background: STATUS_STYLES[card.statut].bg, color: STATUS_STYLES[card.statut].color }}>
                                                            {card.statut === 'active' ? t('admin.dashboard.active_status') : card.statut === 'blocked' ? t('admin.dashboard.blocked_status') : t('admin.dashboard.expired_status')}
                                                        </span>
                                                        <button className="ad-filter-btn" style={{ padding: '0.35rem 0.75rem', fontSize: 12.5 }} onClick={() => toggleCardBlock(card)}>
                                                            <Icon name={card.statut === 'active' ? 'lock' : 'unlock'} size={13} />
                                                            {card.statut === 'active' ? t('admin.dashboard.block') : t('admin.dashboard.unblock')}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        )})}
                    </tbody>
                </table>
                </div>

                <div className="ad-pagination">
                    <span style={{ fontSize: 13.5, color: C.muted }}>
                        {t('common.showing', { from: filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtered.length), total: filtered.length, label: t('admin.clients.clients_label') })}
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
