import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { C, fontTitle, Icon, initialsOf, formatDate, useApi, STATUS_STYLES, PAGE_SIZE } from '../theme'

export default function UsersPage() {
    const api = useApi()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [page, setPage] = useState(1)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/users/all')
            setUsers(res.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    const filtered = useMemo(() => users
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
        .filter(u => roleFilter === 'all' || u.role === roleFilter),
    [users, search, roleFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => { setPage(1) }, [search, roleFilter])

    const adminCount = users.filter(u => u.role === 'admin').length
    const clientCount = users.filter(u => u.role === 'client').length

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Utilisateurs</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{adminCount} administrateur(s) · {clientCount} client(s)</p>
                </div>
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div className="ad-search">
                        <Icon name="search" size={16} />
                        <input placeholder="Rechercher un utilisateur par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="ad-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">Tous les rôles</option>
                        <option value="admin">Administrateurs</option>
                        <option value="client">Clients</option>
                    </select>
                    <button className="ad-btn-outline" style={{ marginLeft: 'auto' }} onClick={load}><Icon name="refresh" size={15} /> Actualiser</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Cartes</th><th>Inscription</th></tr></thead>
                    <tbody>
                        {!loading && pageUsers.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>Aucun utilisateur trouvé.</td></tr>
                        )}
                        {pageUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: '50%',
                                            background: u.role === 'admin' ? C.purple : C.tealDark,
                                            color: 'white', fontSize: 12.5, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{initialsOf(u.name)}</div>
                                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: C.muted }}>{u.email}</td>
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[u.role].bg, color: STATUS_STYLES[u.role].color }}>{u.role === 'admin' ? 'Admin' : 'Client'}</span></td>
                                <td>{u.cards_count}</td>
                                <td style={{ color: C.muted }}>{formatDate(u.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                <div className="ad-pagination">
                    <span style={{ fontSize: 13.5, color: C.muted }}>
                        Affichage de {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} utilisateurs
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
