import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { C, fontTitle, Icon, initialsOf, formatDate, useApi, STATUS_STYLES, PAGE_SIZE } from '../theme'

export default function ClientsPage() {
    const api = useApi()
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
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Clients</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>
                        {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''} sur la plateforme.
                    </p>
                </div>
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div className="ad-search">
                        <Icon name="search" size={16} />
                        <input placeholder="Rechercher un client par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="ad-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ appearance: 'none' }}>
                        <option value="recent">Plus récents</option>
                        <option value="name">Nom (A → Z)</option>
                        <option value="cards">Nombre de cartes</option>
                    </select>
                    <div className={`ad-filter-btn ${onlyWithCards ? 'on' : ''}`} onClick={() => setOnlyWithCards(v => !v)}>
                        <Icon name="filter" size={15} color={onlyWithCards ? 'white' : C.muted} /> Avec cartes uniquement
                    </div>
                    <button className="ad-btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>
                        <Icon name="refresh" size={15} /> Actualiser
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>Client</th><th>Email</th><th>Cartes</th><th>Statut</th><th>Inscription</th><th></th></tr></thead>
                    <tbody>
                        {!loading && pageClients.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>Aucun client trouvé.</td></tr>
                        )}
                        {pageClients.map(c => {
                            const status = c.cards_count > 0 ? 'Actif' : 'Nouveau'
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
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[status].bg, color: STATUS_STYLES[status].color }}>{status}</span></td>
                                <td style={{ color: C.muted }}>{formatDate(c.created_at)}</td>
                                <td style={{ position: 'relative' }}>
                                    <button className="ad-icon-btn" onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}><Icon name="dots" /></button>
                                    {openMenuId === c.id && (
                                        <div className="ad-menu">
                                            <button className="ad-menu-item" onClick={() => { setExpandedId(isExpanded ? null : c.id); setOpenMenuId(null) }}>
                                                <Icon name="card" size={15} /> {isExpanded ? 'Masquer les cartes' : 'Voir les cartes'}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {isExpanded && (
                                <tr>
                                    <td colSpan={6} style={{ background: '#F8FAFC', padding: '0.9rem 1rem' }}>
                                        {cardsOf(c.id).length === 0 ? (
                                            <span style={{ color: C.muted, fontSize: 13.5 }}>Ce client n'a aucune carte.</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {cardsOf(c.id).map(card => (
                                                    <div key={card.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
                                                        <span style={{ fontFamily: 'monospace' }}>{card.pan}</span>
                                                        <span style={{ textTransform: 'capitalize' }}>{card.type}</span>
                                                        <span>{Number(card.plafond).toLocaleString('fr-FR')} MAD</span>
                                                        <span className="ad-status-pill" style={{ background: STATUS_STYLES[card.statut].bg, color: STATUS_STYLES[card.statut].color }}>
                                                            {card.statut === 'active' ? 'Active' : card.statut === 'blocked' ? 'Bloquée' : 'Expirée'}
                                                        </span>
                                                        <button className="ad-filter-btn" style={{ padding: '0.35rem 0.75rem', fontSize: 12.5 }} onClick={() => toggleCardBlock(card)}>
                                                            <Icon name={card.statut === 'active' ? 'lock' : 'unlock'} size={13} />
                                                            {card.statut === 'active' ? 'Bloquer' : 'Débloquer'}
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
                        Affichage de {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} clients
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
