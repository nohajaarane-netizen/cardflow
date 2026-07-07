import React, { useState } from 'react'
import { C, fontTitle, Icon } from '../../admin/theme'
import { useLanguage } from '../../i18n/LanguageContext'

export default function SupportPage() {
    const { t } = useLanguage()
    const [openFaq, setOpenFaq] = useState(0)
    const [form, setForm] = useState({ subject: '', message: '' })
    const [sent, setSent] = useState(false)

    const FAQ = [
        { q: t('client.support.faq1_q'), a: t('client.support.faq1_a') },
        { q: t('client.support.faq2_q'), a: t('client.support.faq2_a') },
        { q: t('client.support.faq3_q'), a: t('client.support.faq3_a') },
        { q: t('client.support.faq4_q'), a: t('client.support.faq4_a') },
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        setSent(true)
        setForm({ subject: '', message: '' })
    }

    return (
        <>
            <div className="ad-page-header">
                <div>
                    <h1 style={{ fontFamily: fontTitle, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>{t('client.support.title')}</h1>
                    <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 0' }}>{t('client.support.subtitle')}</p>
                </div>
            </div>

            <div className="ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { icon: 'mail', label: t('client.support.email_label'), value: 'support@cardflow.com' },
                    { icon: 'phone', label: t('client.support.phone_label'), value: '+212 5 22 00 00 00' },
                    { icon: 'chat', label: t('client.support.chat_label'), value: t('client.support.chat_hours') },
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
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 0.5rem' }}>{t('client.support.faq_title')}</h2>
                    <div style={{ marginTop: '2.2rem' }}>
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
                    <h2 style={{ fontFamily: fontTitle, fontSize: 17, fontWeight: 800, color: C.text, margin: '0 0 1.2rem' }}>{t('client.support.contact_title')}</h2>
                    {sent ? (
                        <div className="ad-alert-banner" style={{ background: C.greenBg, color: C.green }}>
                            <Icon name="check" size={15} color={C.green} /> {t('client.support.sent_msg')}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <label className="ad-form-label">{t('client.support.subject')}</label>
                            <input className="ad-form-input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('client.support.subject_placeholder')} />
                            <label className="ad-form-label">{t('client.support.message')}</label>
                            <textarea className="ad-form-input" required rows={5} style={{ resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('client.support.message_placeholder')} />
                            <button className="ad-issue-btn" type="submit">{t('client.support.send')} <Icon name="arrowRight" color="white" size={17} /></button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
