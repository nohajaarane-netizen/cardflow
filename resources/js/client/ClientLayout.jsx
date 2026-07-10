import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi, sharedCss } from '../admin/theme'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitch from '../i18n/LanguageSwitch'
import Logo from '../components/Logo'

const MAIN_NAV = [
    { to: '/client/dashboard',     key: 'nav.client.dashboard',     icon: 'home' },
    { to: '/client/cards',         key: 'nav.client.cards',         icon: 'card' },
    { to: '/client/beneficiaries', key: 'nav.client.beneficiaries', icon: 'users' },
    { to: '/client/payments',      key: 'nav.client.payments',      icon: 'swap' },
    { to: '/client/analytics',     key: 'nav.client.analytics',     icon: 'chart' },
]

const OTHER_NAV = [
    { to: '/client/settings', key: 'nav.client.settings', icon: 'sliders' },
    { to: '/client/support',  key: 'nav.client.support',  icon: 'chat' },
]

export default function ClientLayout() {
    const navigate = useNavigate()
    const api = useApi()
    const { t } = useLanguage()
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
    const [unreadAlerts, setUnreadAlerts] = useState(0)

    const refreshBadge = useCallback(async () => {
        try {
            const res = await api.get('/alerts')
            setUnreadAlerts(res.data.filter(a => !a.lue).length)
        } catch { /* silencieux — le badge n'est pas critique */ }
    }, [api])

    useEffect(() => { refreshBadge() }, [refreshBadge])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
    }

    const renderNavItem = (item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `ad-nav-item ${isActive ? 'active' : ''}`} style={{ padding: '0.78rem 0.85rem' }}>
            {({ isActive }) => (
                <>
                    <span style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
                        transition: 'background 0.15s ease',
                    }}>
                        <Icon name={item.icon} size={20} color={isActive ? 'white' : '#4B5565'} />
                    </span>
                    <span style={{ fontSize: 15 }}>{t(item.key)}</span>
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

                <div className="ad-nav-scroll">
                    <div className="ad-nav-group-label">{t('nav.group_main')}</div>
                    <nav className="ad-nav">
                        {MAIN_NAV.map(renderNavItem)}
                    </nav>

                    <div className="ad-nav-group-label">{t('nav.group_other')}</div>
                    <nav className="ad-nav">
                        {OTHER_NAV.map(renderNavItem)}
                    </nav>
                </div>

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
