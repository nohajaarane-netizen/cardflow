import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { C, fontTitle, Icon, StatCard, Sparkline, DonutChart, VerticalBarChart, initialsOf, formatDate, formatMoney, useApi, STATUS_STYLES, PAGE_SIZE } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

const WEEK_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export default function DashboardPage() {
    const { refreshBadge } = useOutletContext()
    const api = useApi()
    const { t } = useLanguage()

    const [clients, setClients] = useState([])
    const [cards, setCards]     = useState([])
    const [alerts, setAlerts]   = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const [search, setSearch] = useState('')
    const [onlyWithCards, setOnlyWithCards] = useState(false)
    const [page, setPage] = useState(1)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    const [formClientId, setFormClientId] = useState('')
    const [formType, setFormType] = useState('visa')
    const [formPlafond, setFormPlafond] = useState('5000')
    const [notifyEmail, setNotifyEmail] = useState(true)
    const [issuing, setIssuing] = useState(false)
    const [issueMsg, setIssueMsg] = useState(null)
    const [clientPickerOpen, setClientPickerOpen] = useState(false)
    const [clientQuery, setClientQuery] = useState('')

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.ad-client-picker')) setClientPickerOpen(false)
            if (!e.target.closest('.ad-row-menu')) setOpenMenuId(null)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadAll = useCallback(async () => {
        setLoading(true)
        setErrorMsg('')
        try {
            const [usersRes, cardsRes, alertsRes] = await Promise.allSettled([
                api.get('/users'), api.get('/cards'), api.get('/alerts'),
            ])
            if (usersRes.status === 'fulfilled') setClients(usersRes.value.data)
            if (cardsRes.status === 'fulfilled') setCards(cardsRes.value.data.data || cardsRes.value.data)
            if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data)
        } catch {
            setErrorMsg(t('admin.dashboard.load_error'))
        } finally {
            setLoading(false)
        }
    }, [api, t])

    useEffect(() => { loadAll() }, [loadAll])

    const cardsOf = (clientId) => cards.filter(c => c.user?.id === clientId)

    const filteredClients = useMemo(() => clients
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
        .filter(c => !onlyWithCards || c.cards_count > 0), [clients, search, onlyWithCards])

    const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE))
    const pageClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => { setPage(1) }, [search, onlyWithCards])

    const activeCards = cards.filter(c => c.statut === 'active').length
    const blockedCards = cards.filter(c => c.statut === 'blocked').length
    const unreadAlerts = alerts.filter(a => !a.lue).length

    const balance = cards.reduce((s, c) => s + Number(c.plafond || 0), 0)

    const cardsByWeekday = useMemo(() => {
        const counts = Array(7).fill(0)
        cards.forEach(c => { if (c.created_at) counts[new Date(c.created_at).getDay()]++ })
        return WEEK_LABELS.map((label, i) => ({ label, value: counts[i] }))
    }, [cards])

    const cardsByType = useMemo(() => ([
        { label: 'Visa', value: cards.filter(c => c.type === 'visa').length, color: C.navy },
        { label: 'Mastercard', value: cards.filter(c => c.type === 'mastercard').length, color: C.teal },
    ]), [cards])

    const toggleCardBlock = async (card) => {
        try {
            const action = card.statut === 'active' ? 'block' : 'unblock'
            await api.patch(`/cards/${card.id}/${action}`)
            await loadAll()
            refreshBadge()
        } catch {
            setErrorMsg(t('admin.dashboard.action_error'))
        }
    }

    const handleIssueCard = async (e) => {
        e.preventDefault()
        setIssueMsg(null)
        if (!formClientId) {
            setIssueMsg({ type: 'error', key: 'admin.dashboard.select_client_error' })
            return
        }
        setIssuing(true)
        try {
            await api.post('/cards', { user_id: formClientId, type: formType, plafond: Number(formPlafond) })
            setIssueMsg({ type: 'success', key: 'admin.dashboard.issue_success' })
            setFormClientId('')
            setFormPlafond('5000')
            await loadAll()
            refreshBadge()
        } catch (err) {
            setIssueMsg({ type: 'error', text: err.response?.data?.message, key: 'admin.dashboard.issue_error' })
        } finally {
            setIssuing(false)
        }
    }

    const selectedClient = clients.find(c => String(c.id) === String(formClientId))

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>
                        {t('admin.dashboard.title')}
                    </h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>
                        {t('admin.dashboard.subtitle')}
                    </p>
                </div>
            </div>

            {errorMsg && (
                <div className="ad-alert-banner" style={{ background: C.redBg, color: C.red }}>
                    <Icon name="close" size={15} color={C.red} /> {errorMsg}
                </div>
            )}

            <div className="ad-hero-grid">
                <div className="ad-hero-stack">
                    <StatCard
                        label={t('admin.dashboard.total_clients')}
                        value={loading ? '…' : clients.length}
                        trend={{ dir: 'up', text: t('admin.dashboard.active_label', { count: clients.length - clients.filter(c => c.cards_count === 0).length }) }}
                        caption={t('admin.dashboard.no_card_count', { count: clients.filter(c => c.cards_count === 0).length })}
                    />
                    <StatCard
                        label={t('admin.dashboard.total_cards')}
                        value={loading ? '…' : cards.length}
                        trend={blockedCards > 0 ? { dir: 'down', text: t('admin.dashboard.blocked_count', { count: blockedCards }) } : { dir: 'up', text: t('admin.dashboard.rasa') }}
                        caption={t('admin.dashboard.active_count', { count: activeCards })}
                    />
                </div>

                <div className="ad-hero-wide">
                    <div>
                        <div className="ad-hero-row">
                            <div>
                                <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{t('admin.dashboard.active_cards')}</div>
                                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: fontTitle, color: C.text, marginTop: 4 }}>{loading ? '…' : activeCards}</div>
                            </div>
                            <span className={`ad-stat-trend ${blockedCards > 0 ? 'down' : 'up'}`}>
                                <Icon name={blockedCards > 0 ? 'arrowDown' : 'arrowUp'} size={10} color={blockedCards > 0 ? C.red : C.green} />
                                {blockedCards > 0 ? t('admin.dashboard.blocked_count', { count: blockedCards }) : t('admin.dashboard.all_active')}
                            </span>
                        </div>
                    </div>
                    <div className="ad-hero-divider" />
                    <div className="ad-hero-row">
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{t('admin.dashboard.fraud_alerts')}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: fontTitle, color: C.text, marginTop: 4 }}>
                                {loading ? '…' : alerts.length} <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>· {t('admin.dashboard.unread_count', { count: unreadAlerts })}</span>
                            </div>
                        </div>
                        <div style={{ width: 90 }}><Sparkline color={C.teal} seed={4} /></div>
                    </div>
                </div>

                <div className="ad-hero-dark">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>{t('admin.dashboard.platform_balance')}</span>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="shield" size={14} color="white" />
                        </div>
                    </div>
                    <div style={{ fontSize: 25, fontWeight: 800, fontFamily: fontTitle }}>{loading ? '…' : formatMoney(balance)}</div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>{t('admin.dashboard.cumulated_ceiling', { count: cards.length })}</div>
                </div>
            </div>

            <div className="ad-grid-2" style={{ marginBottom: '1.25rem', alignItems: 'stretch' }}>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('admin.dashboard.card_distribution')}</h2>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <DonutChart data={cardsByType} centerLabel={t('admin.dashboard.cards_label')} />
                    </div>
                </div>
                <div className="ad-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                        <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.dashboard.cards_per_day')}</h2>
                        <span className="ad-select" style={{ cursor: 'default', padding: '0.4rem 0.8rem', fontSize: 12.5 }}>{t('admin.dashboard.this_week')}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                        <VerticalBarChart data={cardsByWeekday} color={C.teal} highlightMax height={170} />
                    </div>
                </div>
            </div>

            <div className="ad-content-grid" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>
                        {t('admin.dashboard.client_management')}
                    </h2>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div className="ad-search">
                            <Icon name="search" size={16} />
                            <input placeholder={t('admin.dashboard.search_client')} value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className={`ad-filter-btn ${onlyWithCards ? 'on' : ''}`} onClick={() => setOnlyWithCards(v => !v)}>
                            <Icon name="filter" size={15} color={onlyWithCards ? 'white' : C.muted} /> {t('admin.dashboard.only_with_cards')}
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                    <table className="ad-table">
                        <thead>
                            <tr><th>{t('admin.dashboard.client')}</th><th>{t('common.email')}</th><th>{t('admin.dashboard.cards')}</th><th>{t('common.status')}</th><th>{t('admin.dashboard.registration')}</th><th></th></tr>
                        </thead>
                        <tbody>
                            {pageClients.length === 0 && !loading && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: C.muted, padding: '2rem 0' }}>{t('admin.dashboard.no_client_found')}</td></tr>
                            )}
                            {pageClients.map(c => {
                                const status = c.cards_count > 0 ? 'Actif' : 'Nouveau'
                                const statusLabel = c.cards_count > 0 ? t('admin.clients.active') : t('admin.clients.new')
                                const isExpanded = expandedId === c.id
                                return (
                                <React.Fragment key={c.id}>
                                <tr>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: '50%', background: C.tealDark,
                                                color: 'white', fontSize: 12.5, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>{initialsOf(c.name)}</div>
                                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: C.muted }}>{c.email}</td>
                                    <td>{c.cards_count}</td>
                                    <td><span className="ad-status-pill" style={{ background: STATUS_STYLES[status].bg, color: STATUS_STYLES[status].color }}>{statusLabel}</span></td>
                                    <td style={{ color: C.muted }}>{formatDate(c.created_at)}</td>
                                    <td style={{ position: 'relative' }} className="ad-row-menu">
                                        <button className="ad-icon-btn" onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}><Icon name="dots" /></button>
                                        {openMenuId === c.id && (
                                            <div className="ad-menu">
                                                <button className="ad-menu-item" onClick={() => { setExpandedId(isExpanded ? null : c.id); setOpenMenuId(null) }}>
                                                    <Icon name="card" size={15} /> {isExpanded ? t('admin.dashboard.hide_cards') : t('admin.dashboard.view_cards')}
                                                </button>
                                                <button className="ad-menu-item" onClick={() => { setFormClientId(String(c.id)); setOpenMenuId(null) }}>
                                                    <Icon name="check" size={15} /> {t('admin.dashboard.issue_card_action')}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr>
                                        <td colSpan={6} style={{ background: '#F8FAFC', padding: '0.75rem 1rem' }}>
                                            {cardsOf(c.id).length === 0 ? (
                                                <span style={{ color: C.muted, fontSize: 13.5 }}>{t('admin.dashboard.no_card_for_client')}</span>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {cardsOf(c.id).map(card => (
                                                        <div key={card.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
                                                            <span style={{ fontFamily: 'monospace' }}>{card.pan}</span>
                                                            <span style={{ textTransform: 'capitalize' }}>{card.type}</span>
                                                            <span>{Number(card.plafond).toLocaleString('fr-FR')} MAD</span>
                                                            <span className="ad-status-pill" style={{ background: STATUS_STYLES[card.statut].bg, color: STATUS_STYLES[card.statut].color }}>
                                                                {card.statut === 'active' ? t('admin.dashboard.active_status') : card.statut === 'blocked' ? t('admin.dashboard.blocked_status') : t('admin.dashboard.expired_status')}
                                                            </span>
                                                            <button className="ad-filter-btn" style={{ padding: '0.35rem 0.75rem', fontSize: 12.5 }} onClick={() => toggleCardBlock(card)}>
                                                                <Icon name={card.statut === 'active' ? 'lock' : 'unlock'} size={13} />
                                                                {card.statut === 'active' ? t('admin.dashboard.block') : t('admin.dashboard.unblock')}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            )})}
                        </tbody>
                    </table>
                    </div>

                    <div className="ad-pagination">
                        <span style={{ fontSize: 13.5, color: C.muted }}>
                            {t('common.showing', { from: filteredClients.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filteredClients.length), total: filteredClients.length, label: t('admin.dashboard.clients_label') })}
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontFamily: fontTitle, fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.dashboard.issue_card_title')}</h2>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.teal}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="card" color={C.tealDark} size={17} />
                        </div>
                    </div>

                    <form onSubmit={handleIssueCard} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <label className="ad-form-label">{t('admin.dashboard.select_client')}</label>
                        <div className="ad-client-picker" style={{ position: 'relative' }}>
                            <div className="ad-search" style={{ background: C.white }} onClick={() => setClientPickerOpen(true)}>
                                <Icon name="search" size={15} />
                                <input
                                    placeholder={t('admin.dashboard.search_or_pick_client')}
                                    value={clientPickerOpen ? clientQuery : (selectedClient ? selectedClient.name : '')}
                                    onFocus={() => setClientPickerOpen(true)}
                                    onChange={e => { setClientQuery(e.target.value); setFormClientId('') }}
                                />
                                <Icon name="chevron" size={14} style={{ transform: clientPickerOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
                            </div>
                            {clientPickerOpen && (
                                <div className="ad-menu" style={{ width: '100%', maxHeight: 220, overflowY: 'auto' }}>
                                    {clients.filter(c => c.name.toLowerCase().includes(clientQuery.toLowerCase())).length === 0 ? (
                                        <div style={{ padding: '0.75rem 0.9rem', fontSize: 13.5, color: C.muted }}>{t('admin.dashboard.no_client_found_short')}</div>
                                    ) : (
                                        clients.filter(c => c.name.toLowerCase().includes(clientQuery.toLowerCase())).map(c => (
                                            <div key={c.id} className="ad-picker-item" onClick={() => { setFormClientId(String(c.id)); setClientQuery(''); setClientPickerOpen(false) }}>
                                                <span>{c.name}</span>
                                                <span style={{ color: C.muted, fontSize: 12.5 }}>{c.cards_count} {t('admin.dashboard.cards_label')}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <label className="ad-form-label">{t('admin.dashboard.card_type')}</label>
                        <select className="ad-form-input" value={formType} onChange={e => setFormType(e.target.value)}>
                            <option value="visa">Visa</option>
                            <option value="mastercard">Mastercard</option>
                        </select>

                        <label className="ad-form-label">{t('admin.dashboard.currency')}</label>
                        <div className="ad-form-select-btn" style={{ color: C.muted, cursor: 'default' }}><span>MAD — Dirham Marocain</span></div>

                        <label className="ad-form-label">{t('admin.dashboard.limit')}</label>
                        <input className="ad-form-input" type="number" min="100" max="50000" step="50" value={formPlafond} onChange={e => setFormPlafond(e.target.value)} />

                        <label className="ad-form-label">{t('admin.dashboard.expiration')}</label>
                        <div className="ad-form-select-btn" style={{ color: C.muted, cursor: 'default' }}><span>{t('admin.dashboard.expiration_fixed')}</span></div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.1rem' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t('admin.dashboard.email_notify')}</span>
                            <button type="button" className={`ad-toggle ${notifyEmail ? 'on' : 'off'}`} onClick={() => setNotifyEmail(v => !v)} />
                        </div>

                        {issueMsg && (
                            <div className="ad-alert-banner" style={{
                                marginTop: '1rem', marginBottom: 0,
                                background: issueMsg.type === 'success' ? C.greenBg : C.redBg,
                                color: issueMsg.type === 'success' ? C.green : C.red,
                            }}>
                                <Icon name={issueMsg.type === 'success' ? 'check' : 'close'} size={15} color={issueMsg.type === 'success' ? C.green : C.red} />
                                {issueMsg.text || t(issueMsg.key)}
                            </div>
                        )}

                        <button className="ad-issue-btn" type="submit" disabled={issuing} style={{ marginTop: 'auto', paddingTop: '0.9rem' }}>
                            {issuing ? t('admin.dashboard.issuing') : t('admin.dashboard.issue_card_btn')} <Icon name="arrowRight" color="white" size={17} />
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
