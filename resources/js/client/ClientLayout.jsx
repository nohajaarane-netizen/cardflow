import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi, sharedCss } from '../admin/theme'

const MAIN_NAV = [
    { to: '/client/dashboard',     label: 'Dashboard',     icon: 'home' },
    { to: '/client/cards',         label: 'Cards',         icon: 'card' },
    { to: '/client/payments',      label: 'Payments',      icon: 'swap' },
    { to: '/client/beneficiaries', label: 'Beneficiaries', icon: 'users' },
    { to: '/client/analytics',     label: 'Analytics',     icon: 'chart' },
]

const OTHER_NAV = [
    { to: '/client/settings', label: 'Settings', icon: 'gear' },
    { to: '/client/support',  label: 'Support',  icon: 'help' },
]

export default function ClientLayout() {
    const navigate = useNavigate()
    const api = useApi()
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
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `ad-nav-item ${isActive ? 'active' : ''}`}>
            {({ isActive }) => (
                <>
                    <Icon name={item.icon} color={isActive ? 'white' : C.muted} />
                    {item.label}
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
                    <div style={{
                        width: 38, height: 38, borderRadius: 11,
                        background: C.navy,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="6" width="15" height="10" rx="2.5" stroke="white" strokeWidth="1.8"/>
                            <rect x="7" y="9" width="15" height="10" rx="2.5" fill={C.teal} stroke="white" strokeWidth="1.8"/>
                        </svg>
                    </div>
                    <div style={{ fontFamily: fontTitle, fontWeight: 800, fontSize: 18, color: C.text, lineHeight: 1.1 }}>CardFlow</div>
                    <Icon name="chevron" size={14} style={{ marginLeft: 'auto' }} />
                </div>

                <div className="ad-nav-group-label">Menu principal</div>
                <nav className="ad-nav" style={{ flex: 'none' }}>
                    {MAIN_NAV.map(renderNavItem)}
                </nav>

                <div className="ad-nav-group-label">Autres</div>
                <nav className="ad-nav">
                    {OTHER_NAV.map(renderNavItem)}
                </nav>

                <div className="ad-admin-card">
                    <div className="ad-avatar">{initialsOf(user.name) || 'CL'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Client'}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>Client Premium</div>
                    </div>
                    <button className="ad-icon-btn" onClick={handleLogout} title="Se déconnecter">
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
                        <div style={{ fontFamily: fontTitle, fontSize: 19, fontWeight: 800, color: C.text }}>
                            Good morning, {(user.name || 'Client').split(' ')[0]} 👋
                        </div>
                        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                            Here's what's happening with your account today.
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="ad-bell" onClick={refreshBadge} title="Actualiser">
                            <Icon name="refresh" color={C.text} />
                        </button>
                        <div className="ad-bell" title={`${unreadAlerts} alerte(s) non lue(s)`}>
                            <Icon name="bell" color={C.text} />
                            {unreadAlerts > 0 && <div className="ad-badge">{unreadAlerts}</div>}
                        </div>
                        <button className="ad-icon-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLogout} title="Se déconnecter">
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
