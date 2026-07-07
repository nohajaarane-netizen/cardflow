import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, BarChart, VerticalBarChart, DonutChart, formatMoney, txDisplayStatus } from '../../admin/theme'

const WEEK_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export default function AnalyticsPage() {
    const api = useApi()
    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [c, t] = await Promise.allSettled([api.get('/cards'), api.get('/transactions')])
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

    const txByStatus = useMemo(() => ([
        { label: 'Acceptées', value: tx.filter(t => txDisplayStatus(t) === 'accepted').length, color: C.green },
        { label: 'Refusées', value: tx.filter(t => txDisplayStatus(t) === 'refused').length, color: C.red },
        { label: 'Suspectes', value: tx.filter(t => txDisplayStatus(t) === 'suspicious').length, color: C.amber },
    ]), [tx])

    const spendByWeekday = useMemo(() => {
        const totals = Array(7).fill(0)
        tx.forEach(t => { if (t.created_at && t.statut === 'accepted') totals[new Date(t.created_at).getDay()] += Number(t.montant) })
        return WEEK_LABELS.map((label, i) => ({ label, value: Math.round(totals[i]) }))
    }, [tx])

    const topMerchants = useMemo(() => {
        const map = {}
        tx.forEach(t => { map[t.marchand] = (map[t.marchand] || 0) + Number(t.montant) })
        return Object.entries(map)
            .map(([label, value]) => ({ label, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [tx])

    const totalSpent = tx.filter(t => t.statut === 'accepted').reduce((s, t) => s + Number(t.montant), 0)
    const avgSpend = tx.length ? Math.round(totalSpent / (tx.filter(t => t.statut === 'accepted').length || 1)) : 0

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Analytics</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Insights into your spending and card activity.</p>
                </div>
                <button className="ad-btn-outline" onClick={load}><Icon name="refresh" size={15} /> Refresh</button>
            </div>

            <div className="ad-stats">
                <StatCard label="Total spent" value={loading ? '…' : formatMoney(totalSpent)} trend={{ dir: 'up', text: 'accepté' }} />
                <StatCard label="Average payment" value={loading ? '…' : formatMoney(avgSpend)} caption="Par transaction acceptée" />
                <StatCard label="Total transactions" value={loading ? '…' : tx.length} caption={`${txByStatus[0]?.value || 0} acceptées`} />
                <StatCard label="Active cards" value={loading ? '…' : cards.filter(c => c.statut === 'active').length} caption={`sur ${cards.length} carte(s)`} />
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Cards by type</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><DonutChart data={cardsByType} centerLabel="cartes" /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Transactions by status</h2>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><BarChart data={txByStatus} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Spending by day</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                        <VerticalBarChart data={spendByWeekday} color={C.teal} highlightMax height={170} />
                    </div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Top merchants (MAD)</h2>
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
