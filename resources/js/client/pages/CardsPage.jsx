import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, STATUS_STYLES } from '../../admin/theme'

export default function CardsPage() {
    const api = useApi()
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
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>My Cards</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>View and manage your virtual and physical cards.</p>
                </div>
                <button className="ad-btn-outline" onClick={load}><Icon name="refresh" size={15} /> Refresh</button>
            </div>

            <div className="ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatCard label="Total Cards" value={loading ? '…' : counts.total} caption={`${counts.active} active`} />
                <StatCard label="Blocked" value={loading ? '…' : counts.blocked} trend={counts.blocked > 0 ? { dir: 'down', text: `${counts.blocked}` } : null} />
                <StatCard label="Total Limit" value={loading ? '…' : `${counts.limit.toLocaleString('fr-FR')} MAD`} caption="Cumulated ceiling" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.1rem', marginBottom: '1.25rem' }}>
                {cards.map(card => (
                    <div key={card.id} style={{
                        borderRadius: 20, padding: '1.4rem', color: 'white', position: 'relative', overflow: 'hidden',
                        opacity: card.statut === 'blocked' ? 0.55 : 1,
                        background: card.type === 'visa'
                            ? `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`
                            : `linear-gradient(135deg, #1E3A8A, ${C.blueDark})`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>{card.statut === 'blocked' ? 'Blocked Card' : 'Virtual Card'}</span>
                            <span style={{ fontFamily: fontTitle, fontWeight: 800, fontSize: 15 }}>CardFlow</span>
                        </div>
                        <div style={{ fontSize: 19, letterSpacing: 2, fontWeight: 700, fontFamily: 'monospace', margin: '1.8rem 0 1rem' }}>
                            {revealedId === card.id ? card.pan : card.pan.replace(/\d(?=\d{4})/g, '•')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 10, opacity: 0.75, textTransform: 'uppercase' }}>Valid thru</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{card.expiration ? new Date(card.expiration).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' }) : '—'}</div>
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{card.type}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: '1.1rem' }}>
                            <button
                                onClick={() => setRevealedId(revealedId === card.id ? null : card.id)}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 10, padding: '0.55rem', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Icon name={revealedId === card.id ? 'unlock' : 'lock'} size={13} color="white" /> {revealedId === card.id ? 'Hide' : 'Reveal'}
                            </button>
                            <button
                                disabled={busyId === card.id}
                                onClick={() => toggle(card)}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 10, padding: '0.55rem', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Icon name={card.statut === 'active' ? 'lock' : 'unlock'} size={13} color="white" />
                                {busyId === card.id ? '...' : card.statut === 'active' ? 'Lock' : 'Unlock'}
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && cards.length === 0 && (
                    <div className="ad-panel" style={{ textAlign: 'center', color: C.muted, gridColumn: '1 / -1' }}>Vous n'avez aucune carte pour le moment.</div>
                )}
            </div>

            <div className="ad-panel">
                <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>Card Details</h2>
                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>Number</th><th>Type</th><th>Limit</th><th>Status</th><th>Expiry</th></tr></thead>
                    <tbody>
                        {!loading && cards.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2rem 0' }}>Aucune carte trouvée.</td></tr>
                        )}
                        {cards.map(card => (
                            <tr key={card.id}>
                                <td style={{ fontFamily: 'monospace' }}>{card.pan}</td>
                                <td style={{ textTransform: 'capitalize' }}>{card.type}</td>
                                <td>{Number(card.plafond).toLocaleString('fr-FR')} MAD</td>
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[card.statut]?.bg, color: STATUS_STYLES[card.statut]?.color }}>
                                    {card.statut === 'active' ? 'Active' : card.statut === 'blocked' ? 'Blocked' : 'Expired'}
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
