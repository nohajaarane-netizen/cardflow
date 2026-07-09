import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, formatDate, formatMoney, useApi, STATUS_STYLES, PAGE_SIZE } from '../../admin/theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function PaymentsPage() {
    const api = useApi()
    const { t } = useLanguage()
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
            setMsg({ type: 'success', text: res.data.message, key: 'client.payments.otp_sent' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message, key: 'client.payments.initiate_error' })
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
            setMsg({ type: 'success', key: 'client.payments.confirm_success' })
            setStep('form')
            setAmount('')
            setMerchant('')
            setOtp('')
            await load()
        } catch (err) {
            const data = err.response?.data
            setMsg({ type: 'error', text: data?.message, key: 'client.payments.otp_invalid' })
            if (data?.code_reponse === '62') {
                setStep('form')
                setAmount('')
                setMerchant('')
                setOtp('')
                await load()
            }
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.payments.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('client.payments.subtitle')}</p>
                </div>
            </div>

            <div className="ad-content-grid" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>{t('client.payments.history')}</h2>
                    <div style={{ overflowX: 'auto' }}>
                    <table className="ad-table">
                        <thead><tr><th>{t('client.payments.merchant')}</th><th>{t('client.payments.card')}</th><th>{t('common.amount')}</th><th>{t('common.status')}</th><th>{t('common.date')}</th></tr></thead>
                        <tbody>
                            {!loading && pageTx.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2rem 0' }}>{t('client.payments.no_payment')}</td></tr>
                            )}
                            {pageTx.map(tx2 => (
                                <tr key={tx2.id}>
                                    <td style={{ fontWeight: 600 }}>{tx2.marchand}</td>
                                    <td style={{ fontFamily: 'monospace', color: C.muted }}>{tx2.card?.pan}</td>
                                    <td>{formatMoney(tx2.montant)}</td>
                                    <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[tx2.statut]?.bg, color: STATUS_STYLES[tx2.statut]?.color }}>
                                        {tx2.statut === 'accepted' ? t('client.payments.accepted') : t('client.payments.refused')}
                                    </span></td>
                                    <td style={{ color: C.muted }}>{formatDate(tx2.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>

                    <div className="ad-pagination">
                        <span style={{ fontSize: 13.5, color: C.muted }}>
                            {t('common.showing', { from: tx.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, tx.length), total: tx.length, label: t('client.payments.payments_label') })}
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

                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>
                        {step === 'form' ? t('client.payments.new_payment') : t('client.payments.verify_otp')}
                    </h2>

                    {step === 'form' ? (
                        <form onSubmit={handleInitiate} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.payments.card')}</label>
                            <select className="ad-form-input" value={cardId} onChange={e => setCardId(e.target.value)} required>
                                {cards.map(c => <option key={c.id} value={c.id}>{c.pan} — {c.type}</option>)}
                            </select>

                            <label className="ad-form-label">{t('client.payments.merchant')}</label>
                            <input className="ad-form-input" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder={t('client.payments.merchant_placeholder')} required />

                            <label className="ad-form-label">{t('client.payments.amount_mad')}</label>
                            <input className="ad-form-input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required />

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.muted, textAlign: 'center', padding: '1rem 0' }}>
                                <Icon name="shield" size={26} color={C.border} />
                                <span style={{ fontSize: 12.5, maxWidth: 240 }}>{t('client.dashboard.secure_note')}</span>
                            </div>

                            {msg && (
                                <div className="ad-alert-banner" style={{
                                    marginTop: '1rem',
                                    background: msg.type === 'success' ? C.greenBg : C.redBg,
                                    color: msg.type === 'success' ? C.green : C.red,
                                }}>
                                    <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                    {msg.text || t(msg.key)}
                                </div>
                            )}

                            <button className="ad-issue-btn" type="submit" disabled={busy || !cards.length} style={{ marginTop: 'auto', paddingTop: '0.9rem' }}>
                                {busy ? t('client.payments.processing') : t('client.payments.continue')} <Icon name="arrowRight" color="white" size={17} />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 0 }}>{t('client.payments.otp_instructions')}</p>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.payments.otp_code')}</label>
                            <input className="ad-form-input" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: 6, textAlign: 'center', fontSize: 20, fontWeight: 700 }} />

                            {msg && (
                                <div className="ad-alert-banner" style={{
                                    marginTop: '1rem',
                                    background: msg.type === 'success' ? C.greenBg : C.redBg,
                                    color: msg.type === 'success' ? C.green : C.red,
                                }}>
                                    <Icon name={msg.type === 'success' ? 'check' : 'close'} size={15} color={msg.type === 'success' ? C.green : C.red} />
                                    {msg.text || t(msg.key)}
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: '0.9rem' }}>
                                <button className="ad-issue-btn" type="submit" disabled={busy} style={{ marginTop: 0 }}>
                                    {busy ? t('client.payments.verifying') : t('client.payments.confirm_payment')} <Icon name="check" color="white" size={17} />
                                </button>
                                <button type="button" className="ad-btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setStep('form'); setMsg(null) }}>
                                    {t('client.payments.cancel')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
