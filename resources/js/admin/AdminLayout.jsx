import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi, sharedCss } from './theme'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitch from '../i18n/LanguageSwitch'
import Logo from '../components/Logo'

const MAIN_NAV = [
    { to: '/admin/dashboard',    key: 'nav.admin.dashboard',    icon: 'home' },
    { to: '/admin/clients',      key: 'nav.admin.clients',      icon: 'users' },
    { to: '/admin/cards',        key: 'nav.admin.cards',        icon: 'card' },
    { to: '/admin/transactions', key: 'nav.admin.transactions', icon: 'swap' },
    { to: '/admin/disputes',     key: 'nav.admin.disputes',     icon: 'shield' },
    { to: '/admin/analytics',    key: 'nav.admin.analytics',    icon: 'chart' },
]

const OTHER_NAV = [
    { to: '/admin/reports',  key: 'nav.admin.reports',  icon: 'file' },
    { to: '/admin/settings', key: 'nav.admin.settings', icon: 'gear' },
    { to: '/admin/users',    key: 'nav.admin.users',    icon: 'user' },
    { to: '/admin/support',  key: 'nav.admin.support',  icon: 'help' },
]

export default function AdminLayout() {
    const navigate = useNavigate()
    const api = useApi()
    const { t } = useLanguage()
    const [admin] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
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
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `ad-nav-item ${isActive ? 'active' : ''}`}>
            {({ isActive }) => (
                <>
                    <Icon name={item.icon} color={isActive ? 'white' : C.muted} />
                    {t(item.key)}
                    {item.to === '/admin/disputes' && unreadAlerts > 0 && (
                        <span style={{
                            marginLeft: 'auto', background: isActive ? 'rgba(255,255,255,0.25)' : C.red,
                            color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px',
                        }}>{unreadAlerts}</span>
                    )}
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
                    <div className="ad-avatar">{initialsOf(admin.name) || 'AD'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.name || 'Administrateur'}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t('layout.admin_role')}</div>
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
                            {t('layout.admin_greeting', { name: (admin.name || 'Admin').split(' ')[0] })}
                        </div>
                        <div style={{ fontSize: 15, color: C.muted, marginTop: 4 }}>
                            {t('layout.admin_subtitle')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <LanguageSwitch />
                        <button className="ad-bell" onClick={refreshBadge} title={t('common.refresh')}>
                            <Icon name="refresh" color={C.text} />
                        </button>
                        <NavLink to="/admin/disputes" className="ad-bell" title={t('admin.disputes.unread_needs_attention', { count: unreadAlerts })}>
                            <Icon name="bell" color={C.text} />
                            {unreadAlerts > 0 && <div className="ad-badge">{unreadAlerts}</div>}
                        </NavLink>
                        <button className="ad-icon-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLogout} title={t('common.logout')}>
                            <div className="ad-avatar">{initialsOf(admin.name) || 'AD'}</div>
                            <Icon name="chevron" size={16} />
                        </button>
                    </div>
                </div>

                <Outlet context={{ admin, refreshBadge }} />
            </main>
        </div>
        </>
    )
}
