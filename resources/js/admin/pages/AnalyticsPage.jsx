import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, BarChart, VerticalBarChart, DonutChart, formatMoney, txDisplayStatus } from '../theme'

export default function AnalyticsPage() {
    const api = useApi()
    const [clients, setClients] = useState([])
    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [u, c, t] = await Promise.allSettled([api.get('/users'), api.get('/cards'), api.get('/transactions')])
            if (u.status === 'fulfilled') setClients(u.value.data)
            if (c.status === 'fulfilled') setCards(c.value.data.data || c.value.data)
            if (t.status === 'fulfilled') setTx(t.value.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    const cardsByType = useMemo(() => ([
        { label: 'Visa', value: cards.filter(c => c.type === 'visa').length, color: C.navy },
        { label: 'Mastercard', value: cards.filter(c => c.type === 'mastercard').length, color: C.slate },
    ]), [cards])

    const cardsByStatus = useMemo(() => ([
        { label: 'Actives', value: cards.filter(c => c.statut === 'active').length, color: C.green },
        { label: 'Bloquées', value: cards.filter(c => c.statut === 'blocked').length, color: C.red },
        { label: 'Expirées', value: cards.filter(c => c.statut === 'expired').length, color: C.amber },
    ]), [cards])

    const txByStatus = useMemo(() => ([
        { label: 'Acceptées', value: tx.filter(t => txDisplayStatus(t) === 'accepted').length, color: C.green },
        { label: 'Refusées', value: tx.filter(t => txDisplayStatus(t) === 'refused').length, color: C.red },
        { label: 'Suspectes', value: tx.filter(t => txDisplayStatus(t) === 'suspicious').length, color: C.amber },
    ]), [tx])

    const topMerchants = useMemo(() => {
        const map = {}
        tx.forEach(t => { map[t.marchand] = (map[t.marchand] || 0) + Number(t.montant) })
        return Object.entries(map)
            .map(([label, value]) => ({ label, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [tx])

    const clientsWithoutCards = clients.filter(c => c.cards_count === 0).length
    const avgCardsPerClient = clients.length ? (cards.length / clients.length).toFixed(1) : 0
    const totalVolume = tx.filter(t => t.statut === 'accepted').reduce((s, t) => s + Number(t.montant), 0)
    const otpRate = tx.length ? Math.round((tx.filter(t => t.otp_verifie).length / tx.length) * 100) : 0

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Analytique</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Indicateurs clés calculés à partir des données de la plateforme.</p>
                </div>
                <button className="ad-btn-outline" onClick={load}><Icon name="refresh" size={15} /> Actualiser</button>
            </div>

            <div className="ad-stats">
                <StatCard label="Volume accepté" value={loading ? '…' : formatMoney(totalVolume)} trend={{ dir: 'up', text: 'accepté' }} />
                <StatCard label="Cartes / client (moy.)" value={loading ? '…' : avgCardsPerClient} caption="Sur l'ensemble des clients" />
                <StatCard label="Clients sans carte" value={loading ? '…' : clientsWithoutCards} trend={clientsWithoutCards > 0 ? { dir: 'down', text: 'à activer' } : null} />
                <StatCard label="Taux de vérification 3DS" value={loading ? '…' : `${otpRate}%`} trend={{ dir: otpRate >= 50 ? 'up' : 'down', text: otpRate >= 50 ? 'sain' : 'faible' }} />
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Répartition des cartes par type</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><DonutChart data={cardsByType} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Statut des cartes</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><DonutChart data={cardsByStatus} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Transactions par statut</h2>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><BarChart data={txByStatus} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Top marchands (volume MAD)</h2>
                    {topMerchants.length === 0 ? (
                        <span style={{ color: C.muted, fontSize: 13.5 }}>Aucune transaction enregistrée.</span>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                            <VerticalBarChart data={topMerchants} color={C.teal} highlightMax height={200} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
