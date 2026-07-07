import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { C, fontTitle, Icon, formatDate, formatMoney, useApi, STATUS_STYLES, PAGE_SIZE } from '../../admin/theme'

export default function DashboardPage() {
    const api = useApi()

    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [beneficiaries, setBeneficiaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const [statusFilter, setStatusFilter] = useState('all')

    const [payBeneficiary, setPayBeneficiary] = useState('')
    const [payAmount, setPayAmount] = useState('')
    const [payDesc, setPayDesc] = useState('')
    const [paying, setPaying] = useState(false)
    const [payMsg, setPayMsg] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setErrorMsg('')
        try {
            const [cardsRes, txRes] = await Promise.allSettled([api.get('/cards'), api.get('/transactions')])
            if (cardsRes.status === 'fulfilled') setCards(cardsRes.value.data.data || cardsRes.value.data)
            if (txRes.status === 'fulfilled') setTx(txRes.value.data)
        } catch {
            setErrorMsg("Impossible de charger vos données.")
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        setBeneficiaries(JSON.parse(localStorage.getItem('cf_beneficiaries') || '[]'))
    }, [])

    const filteredTx = useMemo(() => tx
        .filter(t => statusFilter === 'all' || t.statut === statusFilter)
        .slice(0, 8), [tx, statusFilter])

    const activeCards = cards.filter(c => c.statut === 'active')
    const totalBalance = cards.reduce((s, c) => s + Number(c.plafond || 0), 0)

    const handlePay = async (e) => {
        e.preventDefault()
        setPayMsg(null)
        if (!payBeneficiary) {
            setPayMsg({ type: 'error', text: 'Veuillez sélectionner un bénéficiaire.' })
            return
        }
        if (!activeCards.length) {
            setPayMsg({ type: 'error', text: "Vous n'avez aucune carte active." })
            return
        }
        setPaying(true)
        try {
            const beneficiary = beneficiaries.find(b => String(b.id) === String(payBeneficiary))
            await api.post('/payment', {
                card_id: activeCards[0].id,
                montant: Number(payAmount),
                marchand: beneficiary ? beneficiary.name : payDesc || 'Virement',
            })
            setPayMsg({ type: 'success', text: 'Paiement envoyé avec succès.' })
            setPayAmount('')
            setPayDesc('')
            await load()
        } catch (err) {
            setPayMsg({ type: 'error', text: err.response?.data?.message || 'Le paiement a été refusé.' })
        } finally {
            setPaying(false)
        }
    }

    return (
        <>
            {errorMsg && (
                <div className="ad-alert-banner" style={{ background: C.redBg, color: C.red }}>
                    <Icon name="close" size={15} color={C.red} /> {errorMsg}
                </div>
            )}

            <div className="ad-content-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="ad-panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                        <h2 style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>Transaction Activity</h2>
                        <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="accepted">Completed</option>
                            <option value="refused">Failed</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {!loading && filteredTx.length === 0 && (
                            <div style={{ textAlign: 'center', color: C.muted, padding: '2rem 0' }}>Aucune transaction pour le moment.</div>
                        )}
                        {filteredTx.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.9rem 0', borderBottom: `1px solid ${C.border}` }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12, background: C.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Icon name={t.statut === 'accepted' ? 'arrowDown' : 'close'} color={t.statut === 'accepted' ? C.green : C.red} size={17} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{t.marchand}</div>
                                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{formatDate(t.created_at)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: t.statut === 'accepted' ? C.text : C.muted }}>
                                        -{formatMoney(t.montant)}
                                    </div>
                                    <span className="ad-status-pill" style={{ background: STATUS_STYLES[t.statut]?.bg, color: STATUS_STYLES[t.statut]?.color, fontSize: 11, padding: '2px 8px', marginTop: 4 }}>
                                        {t.statut === 'accepted' ? 'Completed' : t.statut === 'suspicious' ? 'Suspicious' : 'Failed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {cards.slice(0, 2).map((card, i) => (
                        <div key={card.id} style={{
                            borderRadius: 20, padding: '1.4rem', color: 'white', position: 'relative', overflow: 'hidden',
                            background: card.type === 'visa'
                                ? `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`
                                : `linear-gradient(135deg, #1E3A8A, ${C.blueDark})`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>Virtual Card</span>
                                <span style={{ fontFamily: fontTitle, fontWeight: 800, fontSize: 15 }}>CardFlow</span>
                            </div>
                            <div style={{ fontSize: 20, letterSpacing: 2, fontWeight: 700, fontFamily: 'monospace', margin: '1.8rem 0 1rem' }}>
                                {card.pan}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 10, opacity: 0.75, textTransform: 'uppercase' }}>Valid thru</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{card.expiration ? new Date(card.expiration).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' }) : '—'}</div>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{card.type}</div>
                            </div>
                        </div>
                    ))}
                    {!loading && cards.length === 0 && (
                        <div className="ad-panel" style={{ textAlign: 'center', color: C.muted }}>Vous n'avez aucune carte pour le moment.</div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="ad-hero-dark" style={{ flex: 1, borderRadius: 18, padding: '1.1rem' }}>
                            <span style={{ fontSize: 12.5, opacity: 0.8, fontWeight: 600 }}>Total Balance</span>
                            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: fontTitle, marginTop: 6 }}>{loading ? '…' : formatMoney(totalBalance)}</div>
                            <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 4 }}>Available to spend</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.2rem' }}>
                    <div className="ad-stat-icon" style={{ background: C.tealDark, marginBottom: 0 }}><Icon name="swap" color="white" size={19} /></div>
                    <div>
                        <h2 style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>Quick Payment</h2>
                        <p style={{ fontSize: 13, color: C.muted, margin: '2px 0 0' }}>Send money quickly and securely to anyone.</p>
                    </div>
                </div>

                <form onSubmit={handlePay} className="ad-grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', gap: '1rem' }}>
                    <div>
                        <label className="ad-form-label" style={{ marginTop: 0 }}>Beneficiary</label>
                        <select className="ad-form-input" value={payBeneficiary} onChange={e => setPayBeneficiary(e.target.value)}>
                            <option value="">Select Beneficiary</option>
                            {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="ad-form-label" style={{ marginTop: 0 }}>Amount</label>
                        <input className="ad-form-input" type="number" min="1" step="1" placeholder="0.00" value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
                    </div>
                    <div>
                        <label className="ad-form-label" style={{ marginTop: 0 }}>Description (Optional)</label>
                        <input className="ad-form-input" placeholder="Payment for..." value={payDesc} onChange={e => setPayDesc(e.target.value)} />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        <span style={{ fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="shield" size={14} /> All payments are secure and encrypted.
                        </span>
                        <button className="ad-issue-btn" type="submit" disabled={paying} style={{ width: 'auto', padding: '0.8rem 1.5rem' }}>
                            {paying ? 'Sending...' : 'Send Payment'} <Icon name="arrowRight" color="white" size={17} />
                        </button>
                    </div>
                </form>

                {payMsg && (
                    <div className="ad-alert-banner" style={{
                        marginTop: '1rem', marginBottom: 0,
                        background: payMsg.type === 'success' ? C.greenBg : C.redBg,
                        color: payMsg.type === 'success' ? C.green : C.red,
                    }}>
                        <Icon name={payMsg.type === 'success' ? 'check' : 'close'} size={15} color={payMsg.type === 'success' ? C.green : C.red} />
                        {payMsg.text}
                    </div>
                )}
            </div>
        </>
    )
}
