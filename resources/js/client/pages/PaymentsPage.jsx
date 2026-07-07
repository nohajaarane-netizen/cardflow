import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, formatDate, formatMoney, useApi, STATUS_STYLES, PAGE_SIZE } from '../../admin/theme'

export default function PaymentsPage() {
    const api = useApi()
    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    const [cardId, setCardId] = useState('')
    const [amount, setAmount] = useState('')
    const [merchant, setMerchant] = useState('')
    const [step, setStep] = useState('form')
    const [cacheKey, setCacheKey] = useState('')
    const [otp, setOtp] = useState('')
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [cardsRes, txRes] = await Promise.allSettled([api.get('/cards'), api.get('/transactions')])
            if (cardsRes.status === 'fulfilled') {
                const list = cardsRes.value.data.data || cardsRes.value.data
                setCards(list)
                if (list.length && !cardId) setCardId(String(list[0].id))
            }
            if (txRes.status === 'fulfilled') setTx(txRes.value.data)
        } finally {
            setLoading(false)
        }
    }, [api, cardId])

    useEffect(() => { load() }, [])

    const totalPages = Math.max(1, Math.ceil(tx.length / PAGE_SIZE))
    const pageTx = tx.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleInitiate = async (e) => {
        e.preventDefault()
        setMsg(null)
        setBusy(true)
        try {
            const res = await api.post('/payment/initiate', { card_id: cardId, montant: Number(amount), marchand: merchant })
            setCacheKey(res.data.cache_key)
            setStep('otp')
            setMsg({ type: 'success', text: res.data.message || 'Un code OTP a été envoyé.' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || "Impossible d'initier le paiement." })
        } finally {
            setBusy(false)
        }
    }

    const handleConfirm = async (e) => {
        e.preventDefault()
        setMsg(null)
        setBusy(true)
        try {
            await api.post('/payment/confirm', { cache_key: cacheKey, otp })
            setMsg({ type: 'success', text: 'Paiement confirmé avec succès.' })
            setStep('form')
            setAmount('')
            setMerchant('')
            setOtp('')
            await load()
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Code OTP invalide.' })
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Payments</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Pay securely with 3D Secure verification.</p>
                </div>
            </div>

            <div className="ad-content-grid">
                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>Payment History</h2>
                    <div style={{ overflowX: 'auto' }}>
                    <table className="ad-table">
                        <thead><tr><th>Merchant</th><th>Card</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {!loading && pageTx.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2rem 0' }}>Aucun paiement pour le moment.</td></tr>
                            )}
                            {pageTx.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontWeight: 600 }}>{t.marchand}</td>
                                    <td style={{ fontFamily: 'monospace', color: C.muted }}>{t.card?.pan}</td>
                                    <td>{formatMoney(t.montant)}</td>
                                    <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[t.statut]?.bg, color: STATUS_STYLES[t.statut]?.color }}>
                                        {t.statut === 'accepted' ? 'Accepted' : 'Refused'}
                                    </span></td>
                                    <td style={{ color: C.muted }}>{formatDate(t.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>

                    <div className="ad-pagination">
                        <span style={{ fontSize: 13.5, color: C.muted }}>
                            Showing {tx.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, tx.length)} of {tx.length} payments
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="ad-page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><Icon name="arrowLeft" size={14} color={C.text} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(n => (
                                <button key={n} className={`ad-page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                            ))}
                            <button className="ad-page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><Icon name="arrowRight" size={14} color={C.text} /></button>
                        </div>
                    </div>
                </div>

                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>
                        {step === 'form' ? 'New Payment' : 'Verify with OTP'}
                    </h2>

                    {step === 'form' ? (
                        <form onSubmit={handleInitiate}>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>Card</label>
                            <select className="ad-form-input" value={cardId} onChange={e => setCardId(e.target.value)} required>
                                {cards.map(c => <option key={c.id} value={c.id}>{c.pan} — {c.type}</option>)}
                            </select>

                            <label className="ad-form-label">Merchant</label>
                            <input className="ad-form-input" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Ex : Marjane Market" required />

                            <label className="ad-form-label">Amount (MAD)</label>
                            <input className="ad-form-input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required />

                            {msg && (
                                <div className="ad-alert-banner" style={{
                                    marginTop: '1rem',
                                    background: msg.type === 'success' ? C.greenBg : C.redBg,
                                    color: msg.type === 'success' ? C.green : C.red,
                                }}>
                                    <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                    {msg.text}
                                </div>
                            )}

                            <button className="ad-issue-btn" type="submit" disabled={busy || !cards.length}>
                                {busy ? 'Processing...' : 'Continue'} <Icon name="arrowRight" color="white" size={17} />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleConfirm}>
                            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 0 }}>Entrez le code à 6 chiffres reçu pour confirmer ce paiement.</p>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>OTP Code</label>
                            <input className="ad-form-input" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: 6, textAlign: 'center', fontSize: 20, fontWeight: 700 }} />

                            {msg && (
                                <div className="ad-alert-banner" style={{
                                    marginTop: '1rem',
                                    background: msg.type === 'success' ? C.greenBg : C.redBg,
                                    color: msg.type === 'success' ? C.green : C.red,
                                }}>
                                    <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                    {msg.text}
                                </div>
                            )}

                            <button className="ad-issue-btn" type="submit" disabled={busy}>
                                {busy ? 'Verifying...' : 'Confirm Payment'} <Icon name="check" color="white" size={17} />
                            </button>
                            <button type="button" className="ad-btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }} onClick={() => { setStep('form'); setMsg(null) }}>
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
