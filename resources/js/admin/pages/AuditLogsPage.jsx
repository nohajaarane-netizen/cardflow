import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, formatDateTime, useApi, PAGE_SIZE } from '../theme'
import { useLanguage } from '../../i18n/LanguageContext'

const ACTION_STYLES = {
    login: { bg: C.greenBg, color: C.green },
    login_failed: { bg: C.redBg, color: C.red },
    logout: { bg: '#F1F5F9', color: C.muted },
    register: { bg: C.greenBg, color: C.green },
    create_card: { bg: '#E4ECFB', color: C.blueDark },
    block_card: { bg: C.redBg, color: C.red },
    unblock_card: { bg: C.greenBg, color: C.green },
    payment_direct: { bg: C.amberBg, color: C.amber },
    payment_initiate: { bg: C.amberBg, color: C.amber },
    payment_confirm: { bg: C.amberBg, color: C.amber },
    update_profile: { bg: '#EDE9FE', color: C.purple },
}

export default function AuditLogsPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [actionFilter, setActionFilter] = useState('all')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page, per_page: PAGE_SIZE }
            if (actionFilter !== 'all') params.action = actionFilter
            const res = await api.get('/audit-logs', { params })
            setLogs(res.data.data)
            setTotal(res.data.total)
        } finally {
            setLoading(false)
        }
    }, [api, page, actionFilter])

    useEffect(() => { load() }, [load])
    useEffect(() => { setPage(1) }, [actionFilter])

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const pageLogs = logs

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('admin.audit_logs.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('admin.audit_logs.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <select className="ad-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
                        <option value="all">{t('admin.audit_logs.action')} — {t('admin.transactions.all_status')}</option>
                        {Object.keys(ACTION_STYLES).map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                    <button className="ad-btn-outline" onClick={load}>
                        <Icon name="refresh" size={15} /> {t('common.refresh')}
                    </button>
                </div>
            </div>

            <div className="ad-panel">
                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead>
                        <tr>
                            <th>{t('common.date')}</th>
                            <th>{t('admin.audit_logs.user')}</th>
                            <th>{t('admin.audit_logs.action')}</th>
                            <th>{t('admin.audit_logs.ip')}</th>
                            <th>{t('admin.audit_logs.details')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && pageLogs.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>{t('admin.audit_logs.no_log')}</td></tr>
                        )}
                        {pageLogs.map(log => (
                            <tr key={log.id}>
                                <td style={{ color: C.muted, fontFamily: 'monospace', fontSize: 12.5 }}>{formatDateTime(log.created_at)}</td>
                                <td>
                                    {log.user ? (
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{log.user.name}</div>
                                            <div style={{ fontSize: 12, color: C.muted }}>{log.user.email}</div>
                                        </div>
                                    ) : (
                                        <span style={{ color: C.muted }}>—</span>
                                    )}
                                </td>
                                <td>
                                    <span className="ad-status-pill" style={{ background: ACTION_STYLES[log.action]?.bg || '#F1F5F9', color: ACTION_STYLES[log.action]?.color || C.muted }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'monospace', color: C.muted }}>{log.ip}</td>
                                <td style={{ color: C.muted, fontSize: 13, maxWidth: 320 }}>
                                    {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                <div className="ad-pagination">
                    <span style={{ fontSize: 13.5, color: C.muted }}>
                        {t('common.showing', { from: total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, total), total, label: t('admin.audit_logs.logs_label') })}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="ad-page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><Icon name="arrowLeft" size={14} color={C.text} /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
                            <button key={n} className={`ad-page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                        ))}
                        <button className="ad-page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><Icon name="arrowRight" size={14} color={C.text} /></button>
                    </div>
                </div>
            </div>
        </>
    )
}
