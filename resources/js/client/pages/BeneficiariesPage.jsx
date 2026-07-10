import React, { useState, useEffect, useCallback } from 'react'
import { C, fontTitle, Icon, initialsOf, useApi } from '../../admin/theme'
import { useLanguage } from '../../i18n/LanguageContext'

// Formate un RIB (24 chiffres) en groupes lisibles : 3-3-16-2
const formatRib = (rib = '') => {
    const s = String(rib).replace(/\s+/g, '')
    if (s.length !== 24) return rib
    return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 22)} ${s.slice(22)}`
}

export default function BeneficiariesPage() {
    const api = useApi()
    const { t } = useLanguage()
    const [beneficiaries, setBeneficiaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [prenom, setPrenom] = useState('')
    const [nom, setNom] = useState('')
    const [rib, setRib] = useState('')
    const [banque, setBanque] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [openMenuId, setOpenMenuId] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/beneficiaries')
            setBeneficiaries(res.data)
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.ad-row-menu')) setOpenMenuId(null)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            await api.post('/beneficiaries', { prenom, nom, rib: rib.replace(/\s+/g, ''), banque })
            setPrenom(''); setNom(''); setRib(''); setBanque(''); setShowForm(false)
            await load()
        } catch (err) {
            setError(err.response?.data?.message
                || Object.values(err.response?.data?.errors || {})[0]?.[0]
                || t('client.beneficiaries.save_error'))
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async (id) => {
        setOpenMenuId(null)
        try {
            await api.delete(`/beneficiaries/${id}`)
            await load()
        } catch { /* silencieux */ }
    }

    const filtered = beneficiaries.filter(b =>
        `${b.prenom} ${b.nom}`.toLowerCase().includes(search.toLowerCase())
        || String(b.rib).includes(search.replace(/\s+/g, '')))

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.beneficiaries.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('client.beneficiaries.subtitle')}</p>
                </div>
                <button className="ad-issue-btn" style={{ width: 'auto', padding: '0.75rem 1.3rem', marginTop: 0 }} onClick={() => { setShowForm(v => !v); setError('') }}>
                    <Icon name="plus" color="white" size={17} /> {t('client.beneficiaries.add')}
                </button>
            </div>

            {showForm && (
                <div className="ad-panel" style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>{t('client.beneficiaries.new_title')}</h2>
                    <form onSubmit={handleAdd} className="ad-grid-2" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start', gap: '1rem' }}>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.beneficiaries.first_name')}</label>
                            <input className="ad-form-input" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder={t('client.beneficiaries.first_name_placeholder')} required />
                        </div>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.beneficiaries.last_name')}</label>
                            <input className="ad-form-input" value={nom} onChange={e => setNom(e.target.value)} placeholder={t('client.beneficiaries.last_name_placeholder')} required />
                        </div>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.beneficiaries.rib')}</label>
                            <input
                                className="ad-form-input"
                                value={rib}
                                onChange={e => setRib(e.target.value)}
                                placeholder={t('client.beneficiaries.rib_placeholder')}
                                inputMode="numeric"
                                pattern="[0-9\s]{24,}"
                                title={t('client.beneficiaries.rib_help')}
                                required
                            />
                            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{t('client.beneficiaries.rib_help')}</div>
                        </div>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>{t('client.beneficiaries.bank')}</label>
                            <input className="ad-form-input" value={banque} onChange={e => setBanque(e.target.value)} placeholder={t('client.beneficiaries.bank_placeholder')} required />
                        </div>

                        {error && (
                            <div className="ad-alert-banner" style={{ gridColumn: '1 / -1', background: C.redBg, color: C.red }}>
                                <Icon name="close" size={15} color={C.red} /> {error}
                            </div>
                        )}

                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="ad-issue-btn" type="submit" disabled={saving} style={{ marginTop: 0, width: 'auto', padding: '0.75rem 1.4rem' }}>
                                {saving ? t('client.beneficiaries.saving') : t('common.save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ad-panel">
                <div className="ad-search" style={{ maxWidth: 340 }}>
                    <Icon name="search" size={16} />
                    <input placeholder={t('client.beneficiaries.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>{t('client.beneficiaries.beneficiary')}</th><th>{t('client.beneficiaries.rib')}</th><th>{t('client.beneficiaries.bank_col')}</th><th></th></tr></thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={4} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>…</td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>
                                {t('client.beneficiaries.empty')}
                            </td></tr>
                        )}
                        {!loading && filtered.map(b => (
                            <tr key={b.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: '50%', background: C.tealDark,
                                            color: 'white', fontSize: 12.5, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{initialsOf(`${b.prenom} ${b.nom}`)}</div>
                                        <span style={{ fontWeight: 600 }}>{b.prenom} {b.nom}</span>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', color: C.muted, fontSize: 12.5 }}>{formatRib(b.rib)}</td>
                                <td>{b.banque}</td>
                                <td style={{ position: 'relative' }} className="ad-row-menu">
                                    <button className="ad-icon-btn" onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}><Icon name="dots" /></button>
                                    {openMenuId === b.id && (
                                        <div className="ad-menu">
                                            <button className="ad-menu-item" onClick={() => handleRemove(b.id)}>
                                                <Icon name="close" size={15} color={C.red} /> {t('client.beneficiaries.remove')}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </>
    )
}
