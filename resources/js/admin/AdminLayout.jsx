import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { C, fontTitle, Icon, initialsOf, useApi, sharedCss } from './theme'

const MAIN_NAV = [
    { to: '/admin/dashboard',    label: 'Tableau de bord', icon: 'home' },
    { to: '/admin/clients',      label: 'Clients',         icon: 'users' },
    { to: '/admin/cards',        label: 'Cartes',          icon: 'card' },
    { to: '/admin/transactions', label: 'Transactions',    icon: 'swap' },
    { to: '/admin/disputes',     label: 'Litiges',         icon: 'shield' },
    { to: '/admin/analytics',    label: 'Analytique',      icon: 'chart' },
]

const OTHER_NAV = [
    { to: '/admin/reports',  label: 'Rapports',    icon: 'file' },
    { to: '/admin/settings', label: 'Paramètres',  icon: 'gear' },
    { to: '/admin/users',    label: 'Utilisateurs', icon: 'user' },
    { to: '/admin/support',  label: 'Support',     icon: 'help' },
]

export default function AdminLayout() {
    const navigate = useNavigate()
    const api = useApi()
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
                    {item.label}
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
                    <div className="ad-avatar">{initialsOf(admin.name) || 'AD'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.name || 'Administrateur'}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>Super Administrateur</div>
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
                            Bienvenue, {(admin.name || 'Admin').split(' ')[0]} !
                        </div>
                        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                            Gérez votre plateforme facilement grâce à des données en temps réel.
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="ad-bell" onClick={refreshBadge} title="Actualiser">
                            <Icon name="refresh" color={C.text} />
                        </button>
                        <NavLink to="/admin/disputes" className="ad-bell" title={`${unreadAlerts} alerte(s) non lue(s)`}>
                            <Icon name="bell" color={C.text} />
                            {unreadAlerts > 0 && <div className="ad-badge">{unreadAlerts}</div>}
                        </NavLink>
                        <button className="ad-icon-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLogout} title="Se déconnecter">
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
