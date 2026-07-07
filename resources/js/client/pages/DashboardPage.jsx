import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, fontTitle, Icon, formatDate, formatMoney, useApi, STATUS_STYLES, PAGE_SIZE } from '../../admin/theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function DashboardPage() {
    const api = useApi()
    const { t } = useLanguage()
    const navigate = useNavigate()

    const [cards, setCards] = useState([])
    const [tx, setTx] = useState([])
    const [beneficiaries, setBeneficiaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const [statusFilter, setStatusFilter] = useState('all')
    const [visibleCount, setVisibleCount] = useState(3)

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
            setErrorMsg(t('client.dashboard.load_error'))
        } finally {
            setLoading(false)
        }
    }, [api, t])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        setBeneficiaries(JSON.parse(localStorage.getItem('cf_beneficiaries') || '[]'))
    }, [])

    const filteredTxAll = useMemo(() => tx
        .filter(t => statusFilter === 'all' || t.statut === statusFilter), [tx, statusFilter])
    const filteredTx = filteredTxAll.slice(0, visibleCount)

    useEffect(() => { setVisibleCount(3) }, [statusFilter])

    const activeCards = cards.filter(c => c.statut === 'active')

    const handlePay = async (e) => {
        e.preventDefault()
        setPayMsg(null)
        if (!payBeneficiary) {
            setPayMsg({ type: 'error', key: 'client.dashboard.select_beneficiary_error' })
            return
        }
        if (!activeCards.length) {
            setPayMsg({ type: 'error', key: 'client.dashboard.no_active_card_error' })
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
            setPayMsg({ type: 'success', key: 'client.dashboard.pay_success' })
            setPayAmount('')
            setPayDesc('')
            await load()
        } catch (err) {
            setPayMsg({ type: 'error', text: err.response?.data?.message, key: 'client.dashboard.pay_error' })
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

            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 480px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                        <h2 style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.dashboard.tx_activity')}</h2>
                        <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">{t('common.all')}</option>
                            <option value="accepted">{t('client.dashboard.completed')}</option>
                            <option value="refused">{t('client.dashboard.failed')}</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {!loading && filteredTx.length === 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: C.muted }}>{t('client.dashboard.no_tx')}</div>
                        )}
                        {filteredTx.map(t2 => (
                            <div key={t2.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.9rem 0', borderBottom: `1px solid ${C.border}` }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12, background: C.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Icon name={t2.statut === 'accepted' ? 'arrowDown' : 'close'} color={t2.statut === 'accepted' ? C.green : C.red} size={17} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{t2.marchand}</div>
                                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{formatDate(t2.created_at)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: t2.statut === 'accepted' ? C.text : C.muted }}>
                                        -{formatMoney(t2.montant)}
                                    </div>
                                    <span className="ad-status-pill" style={{ background: STATUS_STYLES[t2.statut]?.bg, color: STATUS_STYLES[t2.statut]?.color, fontSize: 11, padding: '2px 8px', marginTop: 4 }}>
                                        {t2.statut === 'accepted' ? t('client.dashboard.completed') : t2.statut === 'suspicious' ? t('client.dashboard.suspicious') : t('client.dashboard.failed')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!loading && filteredTx.length > 0 && filteredTx.length < 5 && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.muted, textAlign: 'center', padding: '1rem 0' }}>
                                <Icon name="shield" size={26} color={C.border} />
                                <span style={{ fontSize: 12.5, maxWidth: 240 }}>{t('client.dashboard.secure_note')}</span>
                            </div>
                        )}
                    </div>

                    {filteredTxAll.length > visibleCount && (
                        <button
                            className="ad-btn-outline"
                            style={{ justifyContent: 'center', marginTop: '1rem', width: '100%' }}
                            onClick={() => setVisibleCount(v => v + 3)}
                        >
                            {t('client.dashboard.show_more')} <Icon name="chevron" size={14} />
                        </button>
                    )}
                </div>

                <div className="ad-panel" style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {cards.slice(0, 2).map((card) => (
                        <div key={card.id} style={{
                            width: '100%', aspectRatio: '1.586 / 1', boxSizing: 'border-box', flexShrink: 0,
                            borderRadius: 20, padding: '1.4rem', color: 'white', position: 'relative', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            background: card.type === 'visa'
                                ? `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`
                                : `linear-gradient(135deg, #2E3650, ${C.navy})`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>{t('client.dashboard.virtual_card')}</span>
                                <span style={{ fontFamily: fontTitle, fontWeight: 800, fontSize: 15 }}>CardFlow</span>
                            </div>
                            <div style={{ fontSize: 20, letterSpacing: 2, fontWeight: 700, fontFamily: 'monospace' }}>
                                {card.pan}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 10, opacity: 0.75, textTransform: 'uppercase' }}>{t('client.dashboard.valid_thru')}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{card.expiration ? new Date(card.expiration).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' }) : '—'}</div>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{card.type}</div>
                            </div>
                        </div>
                    ))}
                    {!loading && cards.length === 0 && (
                        <div style={{ width: '100%', aspectRatio: '1.586 / 1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.muted, background: C.bg, borderRadius: 20 }}>
                            {t('client.dashboard.no_card')}
                        </div>
                    )}

                    <button
                        className="ad-btn-outline"
                        style={{ justifyContent: 'center', width: '100%', marginTop: 'auto' }}
                        onClick={() => navigate('/client/cards')}
                    >
                        <Icon name="card" size={15} /> {t('client.dashboard.view_all_cards')}
                    </button>
                </div>
            </div>

            <div className="ad-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.2rem' }}>
                    <div className="ad-stat-icon" style={{ background: C.tealDark, marginBottom: 0 }}><Icon name="swap" color="white" size={19} /></div>
                    <div>
                        <h2 style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.dashboard.quick_payment')}</h2>
                        <p style={{ fontSize: 13, color: C.muted, margin: '2px 0 0' }}>{t('client.dashboard.quick_payment_desc')}</p>
                    </div>
                </div>

                <form onSubmit={handlePay} className="ad-grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', gap: '1rem' }}>
                    <div>
                        <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.dashboard.beneficiary')}</label>
                        <select className="ad-form-input" value={payBeneficiary} onChange={e => setPayBeneficiary(e.target.value)}>
                            <option value="">{t('client.dashboard.select_beneficiary')}</option>
                            {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.dashboard.amount')}</label>
                        <input className="ad-form-input" type="number" min="1" step="1" placeholder="0.00" value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
                    </div>
                    <div>
                        <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.dashboard.description_optional')}</label>
                        <input className="ad-form-input" placeholder={t('client.dashboard.description_placeholder')} value={payDesc} onChange={e => setPayDesc(e.target.value)} />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        <span style={{ fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="shield" size={14} /> {t('client.dashboard.secure_note')}
                        </span>
                        <button className="ad-issue-btn" type="submit" disabled={paying} style={{ width: 'auto', padding: '0.8rem 1.5rem' }}>
                            {paying ? t('client.dashboard.sending') : t('client.dashboard.send_payment')} <Icon name="arrowRight" color="white" size={17} />
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
                        {payMsg.text || t(payMsg.key)}
                    </div>
                )}
            </div>
        </>
    )
}
