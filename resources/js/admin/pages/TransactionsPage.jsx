import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { C, fontTitle, Icon, StatCard, useApi, STATUS_STYLES, PAGE_SIZE, formatMoney, initialsOf, CATEGORICAL, txDisplayStatus } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

const LABELS = { accepted: 'Acceptée', refused: 'Refusée', suspicious: 'Suspecte' }

function toCsvRow(t) {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['ID', 'Marchand', 'Client', 'Carte', 'Montant', 'Statut', 'Code réponse', 'OTP vérifié', 'Date'].map(esc).join(',')
    const row = [t.id, t.marchand, t.client?.name, t.card?.pan, t.montant, LABELS[txDisplayStatus(t)], t.code_reponse, t.otp_verifie ? 'oui' : 'non', t.created_at].map(esc).join(',')
    return `${header}\n${row}`
}

function downloadCsv(t) {
    const blob = new Blob([toCsvRow(t)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transaction_${t.id}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

function printAsPdf(t) {
    const w = window.open('', '_blank', 'width=420,height=560')
    if (!w) return
    w.document.write(`
        <html><head><title>Reçu transaction #${t.id}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #23261F; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            .muted { color: #888; font-size: 12px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
            td:first-child { color: #888; }
            td:last-child { text-align: right; font-weight: 600; }
        </style></head><body>
        <h1>Reçu CardFlow — Transaction #${t.id}</h1>
        <div class="muted">${new Date(t.created_at).toLocaleString('fr-FR')}</div>
        <table>
            <tr><td>Marchand</td><td>${t.marchand}</td></tr>
            <tr><td>Client</td><td>${t.client?.name || '—'}</td></tr>
            <tr><td>Carte</td><td>${t.card?.pan || '—'}</td></tr>
            <tr><td>Montant</td><td>${Number(t.montant).toLocaleString('fr-FR')} MAD</td></tr>
            <tr><td>Statut</td><td>${LABELS[txDisplayStatus(t)]}</td></tr>
            <tr><td>Code réponse</td><td>${t.code_reponse}</td></tr>
            <tr><td>3D Secure</td><td>${t.otp_verifie ? 'Vérifié' : 'Non vérifié'}</td></tr>
        </table>
        </body></html>
    `)
    w.document.close()
    w.focus()
    w.print()
}

export default function TransactionsPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [tx, setTx] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/transactions')
            setTx(res.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    const filtered = useMemo(() => tx
        .filter(t => t.marchand.toLowerCase().includes(search.toLowerCase()) || (t.client?.name || '').toLowerCase().includes(search.toLowerCase()))
        .filter(t => statusFilter === 'all' || txDisplayStatus(t) === statusFilter),
    [tx, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const pageTx = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => { setPage(1) }, [search, statusFilter])

    const totalVolume = tx.filter(t => t.statut === 'accepted').reduce((s, t) => s + Number(t.montant), 0)
    const suspiciousCount = tx.filter(t => txDisplayStatus(t) === 'suspicious').length
    const acceptedRate = tx.length ? Math.round((tx.filter(t => t.statut === 'accepted').length / tx.length) * 100) : 0

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.transactions.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('admin.transactions.subtitle')}</p>
                </div>
            </div>

            <div className="ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatCard label={t('admin.transactions.total')} value={loading ? '…' : tx.length} caption={t('admin.transactions.all_cards')} />
                <StatCard label={t('admin.transactions.accepted_volume')} value={loading ? '…' : formatMoney(totalVolume)} trend={{ dir: 'up', text: `${acceptedRate}%` }} />
                <StatCard label={t('admin.transactions.suspicious')} value={loading ? '…' : suspiciousCount} trend={suspiciousCount > 0 ? { dir: 'down', text: t('admin.transactions.to_review') } : { dir: 'up', text: t('admin.transactions.rasa') }} />
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div className="ad-search">
                        <Icon name="search" size={16} />
                        <input placeholder={t('admin.transactions.search')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">{t('admin.transactions.all_status')}</option>
                        <option value="accepted">{t('admin.transactions.accepted')}</option>
                        <option value="refused">{t('admin.transactions.refused')}</option>
                        <option value="suspicious">{t('admin.transactions.suspect')}</option>
                    </select>
                    <button className="ad-btn-outline" style={{ marginLeft: 'auto' }} onClick={load}><Icon name="refresh" size={15} /> {t('common.refresh')}</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table ad-table-dark">
                    <thead><tr><th>{t('admin.transactions.merchant')}</th><th>{t('admin.transactions.card')}</th><th>{t('common.amount')}</th><th>{t('common.status')}</th><th>{t('admin.transactions.threeds')}</th><th>{t('common.date')}</th><th>{t('admin.transactions.export')}</th></tr></thead>
                    <tbody>
                        {!loading && pageTx.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>{t('admin.transactions.no_tx_found')}</td></tr>
                        )}
                        {pageTx.map((tx, i) => (
                            <tr key={tx.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="ad-row-avatar" style={{ background: CATEGORICAL[i % CATEGORICAL.length] }}>
                                            {initialsOf(tx.marchand)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{tx.marchand}</div>
                                            <div style={{ fontSize: 12.5, color: C.muted }}>{tx.client?.name || '—'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', color: C.muted }}>{tx.card?.pan}</td>
                                <td style={{ fontWeight: 700 }}>{Number(tx.montant).toLocaleString('fr-FR')} MAD</td>
                                <td>
                                    <span className="ad-status-text" style={{ color: STATUS_STYLES[txDisplayStatus(tx)].color }}>
                                        <span className="ad-status-dot" style={{ background: STATUS_STYLES[txDisplayStatus(tx)].color }} />
                                        {LABELS[txDisplayStatus(tx)]}
                                    </span>
                                </td>
                                <td>
                                    {tx.otp_verifie ? (
                                        <span style={{ color: C.green, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600 }}><Icon name="check" size={14} color={C.green} /> {t('admin.transactions.verified')}</span>
                                    ) : (
                                        <span style={{ color: C.muted, fontSize: 13 }}>{t('admin.transactions.not_verified')}</span>
                                    )}
                                </td>
                                <td style={{ color: C.muted }}>{new Date(tx.created_at).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={() => printAsPdf(tx)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: C.navy, fontSize: 12.5, fontWeight: 700 }}>
                                            <Icon name="download" size={13} color={C.navy} /> PDF
                                        </button>
                                        <button onClick={() => downloadCsv(tx)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12.5, fontWeight: 700 }}>
                                            <Icon name="download" size={13} /> CSV
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                <div className="ad-pagination">
                    <span style={{ fontSize: 13.5, color: C.muted }}>
                        {t('common.showing', { from: filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtered.length), total: filtered.length, label: t('admin.transactions.tx_label') })}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="ad-page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><Icon name="arrowLeft" size={14} color={C.text} /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
                            <button key={n} className={`ad-page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                        ))}
                        <button className="ad-page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><Icon name="arrowRight" size={14} color={C.text} /></button>
                    </div>
                </div>
            </div>
        </>
    )
}
