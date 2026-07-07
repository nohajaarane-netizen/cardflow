import React, { useState } from 'react'
import { C, fontTitle, Icon } from '../../admin/theme'

const FAQ = [
    { q: 'Comment bloquer ma carte ?', a: 'Allez dans "Cards", ouvrez la carte concernée et cliquez sur "Lock". L\'action est immédiate.' },
    { q: 'Comment ajouter un bénéficiaire ?', a: 'Depuis "Beneficiaries", cliquez sur "Add Beneficiary" et renseignez son nom, son IBAN et sa banque.' },
    { q: 'Que signifie un paiement "Suspicious" ?', a: 'Notre moteur de détection de fraude a repéré un comportement inhabituel sur cette transaction et l\'a mise en attente de vérification.' },
    { q: 'Comment fonctionne la vérification 3D Secure ?', a: 'Lors d\'un paiement, un code à 6 chiffres est envoyé pour confirmer votre identité avant validation finale.' },
]

export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState(0)
    const [form, setForm] = useState({ subject: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setSent(true)
        setForm({ subject: '', message: '' })
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Support</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>Besoin d'aide ? Consultez la FAQ ou contactez notre équipe.</p>
                </div>
            </div>

            <div className="ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { icon: 'mail', label: 'Email', value: 'support@cardflow.com' },
                    { icon: 'phone', label: 'Téléphone', value: '+212 5 22 00 00 00' },
                    { icon: 'chat', label: 'Chat en direct', value: 'Lun–Ven, 9h–18h' },
                ].map(c => (
                    <div className="ad-stat-card" key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="ad-stat-icon" style={{ background: C.tealDark, marginBottom: 0 }}><Icon name={c.icon} color="white" size={19} /></div>
                        <div>
                            <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{c.label}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{c.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ad-grid-2" style={{ alignItems: 'stretch' }}>
                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 0.5rem' }}>Questions fréquentes</h2>
                    <div>
                        {FAQ.map((f, i) => (
                            <div className="ad-accordion-item" key={f.q}>
                                <div className="ad-accordion-head" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                                    {f.q}
                                    <Icon name="chevron" size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                                </div>
                                {openFaq === i && <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 1rem', lineHeight: 1.6 }}>{f.a}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ad-panel">
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>Contacter le support</h2>
                    {sent ? (
                        <div className="ad-alert-banner" style={{ background: C.greenBg, color: C.green }}>
                            <Icon name="check" size={15} color={C.green} /> Votre message a été envoyé. Notre équipe vous répondra sous 24h.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <label className="ad-form-label">Sujet</label>
                            <input className="ad-form-input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Ex : Problème de blocage de carte" />
                            <label className="ad-form-label">Message</label>
                            <textarea className="ad-form-input" required rows={5} style={{ resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Décrivez votre problème en détail..." />
                            <button className="ad-issue-btn" type="submit">Envoyer le message <Icon name="arrowRight" color="white" size={17} /></button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
