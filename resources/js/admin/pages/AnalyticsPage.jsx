import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, BarChart, VerticalBarChart, DonutChart, formatMoney, txDisplayStatus } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function AnalyticsPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [clients, setClients] = useState([])
    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [u, c, tr] = await Promise.allSettled([api.get('/users'), api.get('/cards'), api.get('/transactions')])
            if (u.status === 'fulfilled') setClients(u.value.data)
            if (c.status === 'fulfilled') setCards(c.value.data.data || c.value.data)
            if (tr.status === 'fulfilled') setTx(tr.value.data)
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
        { label: t('admin.dashboard.active_status'), value: cards.filter(c => c.statut === 'active').length, color: C.green },
        { label: t('admin.dashboard.blocked_status'), value: cards.filter(c => c.statut === 'blocked').length, color: C.red },
        { label: t('admin.dashboard.expired_status'), value: cards.filter(c => c.statut === 'expired').length, color: C.amber },
    ]), [cards, t])

    const txByStatus = useMemo(() => ([
        { label: t('admin.analytics.accepted_label'), value: tx.filter(t2 => txDisplayStatus(t2) === 'accepted').length, color: C.green },
        { label: t('admin.analytics.refused_label'), value: tx.filter(t2 => txDisplayStatus(t2) === 'refused').length, color: C.red },
        { label: t('admin.analytics.suspicious_label'), value: tx.filter(t2 => txDisplayStatus(t2) === 'suspicious').length, color: C.amber },
    ]), [tx, t])

    const topMerchants = useMemo(() => {
        const map = {}
        tx.forEach(t2 => { map[t2.marchand] = (map[t2.marchand] || 0) + Number(t2.montant) })
        return Object.entries(map)
            .map(([label, value]) => ({ label, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [tx])

    const clientsWithoutCards = clients.filter(c => c.cards_count === 0).length
    const avgCardsPerClient = clients.length ? (cards.length / clients.length).toFixed(1) : 0
    const totalVolume = tx.filter(t2 => t2.statut === 'accepted').reduce((s, t2) => s + Number(t2.montant), 0)
    const otpRate = tx.length ? Math.round((tx.filter(t2 => t2.otp_verifie).length / tx.length) * 100) : 0

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.analytics.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('admin.analytics.subtitle')}</p>
                </div>
                <button className="ad-btn-outline" onClick={load}><Icon name="refresh" size={15} /> {t('common.refresh')}</button>
            </div>

            <div className="ad-stats">
                <StatCard label={t('admin.analytics.accepted_volume')} value={loading ? '…' : formatMoney(totalVolume)} trend={{ dir: 'up', text: t('admin.analytics.accepted') }} />
                <StatCard label={t('admin.analytics.avg_cards')} value={loading ? '…' : avgCardsPerClient} caption={t('admin.analytics.avg_cards_caption')} />
                <StatCard label={t('admin.analytics.no_card_clients')} value={loading ? '…' : clientsWithoutCards} trend={clientsWithoutCards > 0 ? { dir: 'down', text: t('admin.analytics.to_activate') } : null} />
                <StatCard label={t('admin.analytics.otp_rate')} value={loading ? '…' : `${otpRate}%`} trend={{ dir: otpRate >= 50 ? 'up' : 'down', text: otpRate >= 50 ? t('admin.analytics.healthy') : t('admin.analytics.low') }} />
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.analytics.cards_by_type')}</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><DonutChart data={cardsByType} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.analytics.cards_by_status')}</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><DonutChart data={cardsByStatus} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.analytics.tx_by_status')}</h2>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><BarChart data={txByStatus} /></div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.analytics.top_merchants')}</h2>
                    {topMerchants.length === 0 ? (
                        <span style={{ color: C.muted, fontSize: 13.5 }}>{t('admin.analytics.no_tx')}</span>
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
