import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, formatMoney, useApi, sharedCss } from '../admin/theme'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitch from '../i18n/LanguageSwitch'
import Logo from '../components/Logo'

const MAIN_NAV = [
    { to: '/client/dashboard',     key: 'nav.client.dashboard',     icon: 'home' },
    { to: '/client/cards',         key: 'nav.client.cards',         icon: 'card' },
    { to: '/client/payments',      key: 'nav.client.payments',      icon: 'swap' },
    { to: '/client/beneficiaries', key: 'nav.client.beneficiaries', icon: 'users' },
    { to: '/client/analytics',     key: 'nav.client.analytics',     icon: 'chart' },
]

const OTHER_NAV = [
    { to: '/client/settings', key: 'nav.client.settings', icon: 'gear' },
    { to: '/client/support',  key: 'nav.client.support',  icon: 'help' },
]

export default function ClientLayout() {
    const navigate = useNavigate()
    const api = useApi()
    const { t } = useLanguage()
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
    const [unreadAlerts, setUnreadAlerts] = useState(0)
    const [balance, setBalance] = useState(null)
    const [balanceHidden, setBalanceHidden] = useState(false)

    const refreshBadge = useCallback(async () => {
        try {
            const res = await api.get('/alerts')
            setUnreadAlerts(res.data.filter(a => !a.lue).length)
        } catch { /* silencieux — le badge n'est pas critique */ }
    }, [api])

    useEffect(() => { refreshBadge() }, [refreshBadge])

    useEffect(() => {
        api.get('/cards')
            .then(res => {
                const list = res.data.data || res.data
                setBalance(list.reduce((s, c) => s + Number(c.plafond || 0), 0))
            })
            .catch(() => {})
    }, [api])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
    }

    const renderNavItem = (item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `ad-nav-item ${isActive ? 'active' : ''}`}>
            {({ isActive }) => (
                <>
                    <Icon name={item.icon} color={isActive ? 'white' : C.muted} />
                    {t(item.key)}
                </>
            )}
        </NavLink>
    )

    return (
        <>
        <style>{sharedCss}</style>
        <div className="ad-shell">
            <aside className="ad-sidebar">
                <div className="ad-logo">
                    <Logo size={30} color={C.text} />
                </div>

                <div className="ad-nav-group-label">{t('nav.group_main')}</div>
                <nav className="ad-nav" style={{ flex: 'none' }}>
                    {MAIN_NAV.map(renderNavItem)}
                </nav>

                <div className="ad-nav-group-label">{t('nav.group_other')}</div>
                <nav className="ad-nav">
                    {OTHER_NAV.map(renderNavItem)}
                </nav>

                <div className="ad-admin-card">
                    <div className="ad-avatar">{initialsOf(user.name) || 'CL'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Client'}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t('layout.client_role')}</div>
                    </div>
                    <button className="ad-icon-btn" onClick={handleLogout} title={t('common.logout')}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round"/>
                            <path d="M16 17l5-5-5-5M21 12H9" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="ad-balance">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>{t('layout.total_balance')}</span>
                        <button className="ad-icon-btn" style={{ padding: 2 }} onClick={() => setBalanceHidden(v => !v)}>
                            <Icon name="eye" size={16} color="rgba(255,255,255,0.85)" />
                        </button>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: fontTitle, marginTop: 6 }}>
                        {balanceHidden ? '••••••' : (balance === null ? '…' : formatMoney(balance))}
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 4 }}>{t('layout.available_to_spend')}</div>
                </div>
            </aside>

            <main className="ad-main">
                <div className="ad-topbar">
                    <div>
                        <div style={{ fontFamily: fontTitle, fontSize: 24, fontWeight: 800, color: C.text }}>
                            {t('layout.client_greeting', { name: (user.name || 'Client').split(' ')[0].toUpperCase() })}
                        </div>
                        <div style={{ fontSize: 15, color: C.muted, marginTop: 4 }}>
                            {t('layout.client_subtitle')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <LanguageSwitch />
                        <button className="ad-bell" onClick={refreshBadge} title={t('common.refresh')}>
                            <Icon name="refresh" color={C.text} />
                        </button>
                        <div className="ad-bell" title={t('admin.disputes.unread_needs_attention', { count: unreadAlerts })}>
                            <Icon name="bell" color={C.text} />
                            {unreadAlerts > 0 && <div className="ad-badge">{unreadAlerts}</div>}
                        </div>
                        <button className="ad-icon-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLogout} title={t('common.logout')}>
                            <div className="ad-avatar">{initialsOf(user.name) || 'CL'}</div>
                            <Icon name="chevron" size={16} />
                        </button>
                    </div>
                </div>

                <Outlet context={{ user, refreshBadge }} />
            </main>
        </div>
        </>
    )
}
