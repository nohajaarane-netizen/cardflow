import React, { useState, useEffect } from 'react'
import { C, fontTitle, Icon, initialsOf, STATUS_STYLES } from '../../admin/theme'

const STORAGE_KEY = 'cf_beneficiaries'

export default function BeneficiariesPage() {
    const [beneficiaries, setBeneficiaries] = useState([])
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [iban, setIban] = useState('')
    const [bank, setBank] = useState('')
    const [openMenuId, setOpenMenuId] = useState(null)

    useEffect(() => {
        setBeneficiaries(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.ad-row-menu')) setOpenMenuId(null)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const persist = (list) => {
        setBeneficiaries(list)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }

    const handleAdd = (e) => {
        e.preventDefault()
        const newBeneficiary = { id: Date.now(), name, iban, bank, status: 'Active', addedAt: new Date().toISOString() }
        persist([newBeneficiary, ...beneficiaries])
        setName(''); setIban(''); setBank(''); setShowForm(false)
    }

    const handleRemove = (id) => {
        persist(beneficiaries.filter(b => b.id !== id))
        setOpenMenuId(null)
    }

    const filtered = beneficiaries.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Beneficiaries</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Manage the people and businesses you send money to.</p>
                </div>
                <button className="ad-issue-btn" style={{ width: 'auto', padding: '0.75rem 1.3rem', marginTop: 0 }} onClick={() => setShowForm(v => !v)}>
                    <Icon name="plus" color="white" size={17} /> Add Beneficiary
                </button>
            </div>

            {showForm && (
                <div className="ad-panel" style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.1rem' }}>New Beneficiary</h2>
                    <form onSubmit={handleAdd} className="ad-grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end', gap: '1rem' }}>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>Full Name</label>
                            <input className="ad-form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Youssef Alaoui" required />
                        </div>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>IBAN / Account</label>
                            <input className="ad-form-input" value={iban} onChange={e => setIban(e.target.value)} placeholder="MA00 0000 0000..." required />
                        </div>
                        <div>
                            <label className="ad-form-label" style={{ marginTop: 0 }}>Bank</label>
                            <input className="ad-form-input" value={bank} onChange={e => setBank(e.target.value)} placeholder="Ex : Attijariwafa Bank" required />
                        </div>
                        <button className="ad-issue-btn" type="submit" style={{ marginTop: 0, width: 'auto', padding: '0.75rem 1.3rem' }}>Save</button>
                    </form>
                </div>
            )}

            <div className="ad-panel">
                <div className="ad-search" style={{ maxWidth: 340 }}>
                    <Icon name="search" size={16} />
                    <input placeholder="Search beneficiaries..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                    <thead><tr><th>Beneficiary</th><th>IBAN / Account</th><th>Bank</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: C.muted, padding: '2.5rem 0' }}>
                                Aucun bénéficiaire enregistré. Cliquez sur "Add Beneficiary" pour en ajouter un.
                            </td></tr>
                        )}
                        {filtered.map(b => (
                            <tr key={b.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: '50%', background: C.tealDark,
                                            color: 'white', fontSize: 12.5, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>{initialsOf(b.name)}</div>
                                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', color: C.muted }}>{b.iban}</td>
                                <td>{b.bank}</td>
                                <td><span className="ad-status-pill" style={{ background: STATUS_STYLES.Active.bg, color: STATUS_STYLES.Active.color }}>Active</span></td>
                                <td style={{ position: 'relative' }} className="ad-row-menu">
                                    <button className="ad-icon-btn" onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}><Icon name="dots" /></button>
                                    {openMenuId === b.id && (
                                        <div className="ad-menu">
                                            <button className="ad-menu-item" onClick={() => handleRemove(b.id)}>
                                                <Icon name="close" size={15} color={C.red} /> Remove
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
