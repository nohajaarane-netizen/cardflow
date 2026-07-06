import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, useApi, formatMoney, txDisplayStatus } from '../theme'

function toCsv(rows, headers) {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [headers.map(esc).join(',')]
    rows.forEach(r => lines.push(r.map(esc).join(',')))
    return lines.join('\n')
}

function download(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

export default function ReportsPage() {
    const api = useApi()
    const [clients, setClients] = useState([])
    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastExport, setLastExport] = useState(null)

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

    const exportClients = () => {
        const csv = toCsv(clients.map(c => [c.id, c.name, c.email, c.cards_count, c.created_at]), ['ID', 'Nom', 'Email', 'Nb cartes', 'Inscription'])
        download('clients_cardflow.csv', csv)
        setLastExport('Clients')
    }
    const exportCards = () => {
        const csv = toCsv(cards.map(c => [c.id, c.user?.name, c.pan, c.type, c.statut, c.plafond, c.expiration]), ['ID', 'Titulaire', 'Numéro', 'Type', 'Statut', 'Plafond', 'Expiration'])
        download('cartes_cardflow.csv', csv)
        setLastExport('Cartes')
    }
    const exportTx = () => {
        const csv = toCsv(tx.map(t => [t.id, t.client?.name, t.marchand, t.montant, txDisplayStatus(t), t.code_reponse, t.otp_verifie ? 'oui' : 'non', t.created_at]), ['ID', 'Client', 'Marchand', 'Montant', 'Statut', 'Code réponse', 'OTP vérifié', 'Date'])
        download('transactions_cardflow.csv', csv)
        setLastExport('Transactions')
    }

    const totalVolume = tx.filter(t => t.statut === 'accepted').reduce((s, t) => s + Number(t.montant), 0)

    const REPORTS = [
        { key: 'clients', title: 'Rapport clients', desc: `${clients.length} clients — export complet (nom, email, cartes, date d'inscription).`, icon: 'users', color: C.navy, action: exportClients },
        { key: 'cards', title: 'Rapport cartes', desc: `${cards.length} cartes — export complet (titulaire, type, statut, plafond).`, icon: 'card', color: C.slate, action: exportCards },
        { key: 'tx', title: 'Rapport transactions', desc: `${tx.length} transactions pour ${formatMoney(totalVolume)} de volume accepté.`, icon: 'swap', color: C.amber, action: exportTx },
    ]

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Rapports</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Exportez les données de la plateforme au format CSV.</p>
                </div>
                <button className="ad-btn-outline" onClick={load}><Icon name="refresh" size={15} /> Actualiser</button>
            </div>

            {lastExport && (
                <div className="ad-alert-banner" style={{ background: C.greenBg, color: C.green }}>
                    <Icon name="check" size={15} color={C.green} /> Export « {lastExport} » téléchargé avec succès.
                </div>
            )}

            <div className="ad-grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'stretch', gap: '1.75rem' }}>
                {REPORTS.map(r => (
                    <div className="ad-panel" key={r.key} style={{ display: 'flex', flexDirection: 'column', padding: '2.4rem 2.2rem' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16, background: r.color, marginBottom: 22,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Icon name={r.icon} color="white" size={28} /></div>
                        <h3 style={{ fontFamily: fontTitle, fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 10px' }}>{r.title}</h3>
                        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 1.6rem', lineHeight: 1.65, flex: 1 }}>{loading ? 'Chargement...' : r.desc}</p>
                        <button className="ad-issue-btn" style={{ marginTop: 'auto', background: r.color, boxShadow: 'none', padding: '1rem' }} onClick={r.action} disabled={loading}>
                            <Icon name="download" size={17} color="white" /> Télécharger le CSV
                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}
