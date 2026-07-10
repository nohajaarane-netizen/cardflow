import React, { useMemo } from 'react'
import axios from 'axios'

export const font      = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
export const fontTitle = "'Plus Jakarta Sans', 'Inter', sans-serif"

/* Palette HPS — navy sombre + accent terracotta feutré (trait du logo), tons de
   statut désaturés pour un rendu de dashboard bancaire sobre plutôt que criard. */
export const C = {
    navy:     '#1B2340',
    blue:     '#D98A4A',
    blueDark: '#B5502F',
    teal:     '#3F8F82',
    tealDark: '#1B2340',
    slate:    '#6B7280',
    purple:   '#7C6FC4',
    muted:    '#6B7280',
    border:   '#E1E5F0',
    bg:       '#EBEEF6',
    white:    '#FFFFFF',
    text:     '#111111',
    green:    '#2F9E6E',
    greenBg:  '#E3F5EC',
    red:      '#C0453C',
    redBg:    '#FBEAE8',
    amber:    '#B7791F',
    amberBg:  '#FBF2DE',
}

export const CATEGORICAL = [C.tealDark, C.teal, C.blue, C.amber, C.red]

export const PAGE_SIZE = 8

export function initialsOf(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Horodatage précis (jour + heure:minute:seconde) — utilisé pour les logs d'audit,
// où la traçabilité exacte de l'action importe pour la sécurité.
export function formatDateTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

export function formatMoney(n) {
    return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' MAD'
}

/* Une transaction est "suspecte" quand le backend l'a marquée code_reponse=59 (fraude détectée
   par FraudService), même si son statut brut reste 'refused'. Le seeder n'utilise jamais la
   valeur d'enum 'statut' = 'suspicious' — il faut donc dériver l'état via code_reponse. */
export function isSuspicious(t) {
    return t.code_reponse === '59'
}

export function txDisplayStatus(t) {
    if (t.statut === 'accepted') return 'accepted'
    if (isSuspicious(t)) return 'suspicious'
    return 'refused'
}

export function useApi() {
    return useMemo(() => {
        const token = localStorage.getItem('token')
        return axios.create({ baseURL: '/api', headers: { Authorization: `Bearer ${token}` } })
    }, [])
}

export function Icon({ name, size = 18, color = C.muted, style }) {
    const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', style }
    switch (name) {
        case 'home': return <svg {...p}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></svg>
        case 'users': return <svg {...p}><circle cx="9" cy="8" r="3.2" stroke={color} strokeWidth="1.7"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke={color} strokeWidth="1.7" strokeLinecap="round"/><path d="M15.5 5.5a3 3 0 010 6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/><path d="M17 14c2.5.3 4 2 4.5 5" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'card': return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.4" stroke={color} strokeWidth="1.7"/><path d="M2.5 9.5h19" stroke={color} strokeWidth="1.7"/></svg>
        case 'swap': return <svg {...p}><path d="M4 8h13l-3-3M20 16H7l3 3" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'shield': return <svg {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></svg>
        case 'chart': return <svg {...p}><path d="M4 20V10M11 20V4M18 20v-7" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'file': return <svg {...p}><path d="M6 3h8l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v5h5" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></svg>
        case 'gear': return <svg {...p}><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.7"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'sliders': return <svg {...p}><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h13M21 18h-1" stroke={color} strokeWidth="1.7" strokeLinecap="round"/><circle cx="15" cy="6" r="2.1" fill="none" stroke={color} strokeWidth="1.7"/><circle cx="8" cy="12" r="2.1" fill="none" stroke={color} strokeWidth="1.7"/><circle cx="18" cy="18" r="2.1" fill="none" stroke={color} strokeWidth="1.7"/></svg>
        case 'user': return <svg {...p}><circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth="1.7"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'help': return <svg {...p}><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.7"/><path d="M9.5 9.3a2.5 2.5 0 014.9.7c0 1.7-2.4 1.9-2.4 3.6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="17" r="0.9" fill={color}/></svg>
        case 'bell': return <svg {...p}><path d="M6 9a6 6 0 0112 0v5l1.5 3h-15L6 14V9z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/><path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'search': return <svg {...p}><circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="1.7"/><path d="M20 20l-4.5-4.5" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'filter': return <svg {...p}><path d="M4 5h16M7 12h10M10 19h4" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'chevron': return <svg {...p}><path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'dots': return <svg {...p}><circle cx="12" cy="5" r="1.4" fill={color}/><circle cx="12" cy="12" r="1.4" fill={color}/><circle cx="12" cy="19" r="1.4" fill={color}/></svg>
        case 'arrowRight': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'arrowLeft': return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'arrowUp': return <svg {...p}><path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'arrowDown': return <svg {...p}><path d="M12 5v14M5 12l7 7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'lock': return <svg {...p}><rect x="4" y="10.5" width="16" height="10" rx="2.4" stroke={color} strokeWidth="1.7"/><path d="M7.5 10.5V7a4.5 4.5 0 019 0v3.5" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'unlock': return <svg {...p}><rect x="4" y="10.5" width="16" height="10" rx="2.4" stroke={color} strokeWidth="1.7"/><path d="M7.5 10.5V7a4.5 4.5 0 018.6-1.8" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'check': return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'close': return <svg {...p}><path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
        case 'refresh': return <svg {...p}><path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" stroke={color} strokeWidth="1.7" strokeLinecap="round"/><path d="M18 3v4h-4M6 21v-4h4" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'download': return <svg {...p}><path d="M12 4v11m0 0l-4-4m4 4l4-4" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19h14" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
        case 'mail': return <svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.2" stroke={color} strokeWidth="1.7"/><path d="M4 7l8 6 8-6" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        case 'phone': return <svg {...p}><path d="M6 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A16.5 16.5 0 015 5.1 1.5 1.5 0 016.5 3.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/></svg>
        case 'chat': return <svg {...p}><path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></svg>
        case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
        case 'eye': return <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.7"/></svg>
        default: return null
    }
}

export function Sparkline({ color, seed }) {
    const points = useMemo(() => {
        let s = seed || 1
        const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
        return Array.from({ length: 14 }, () => 6 + rnd() * 20)
    }, [seed])
    const w = 140, h = 40
    const step = w / (points.length - 1)
    const max = Math.max(...points), min = Math.min(...points)
    const norm = v => h - ((v - min) / (max - min || 1)) * (h - 6) - 3
    const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step},${norm(v)}`).join(' ')
    const area = `${d} L${w},${h} L0,${h} Z`
    const gid = 'spark-' + color.replace('#', '')
    const pathLen = points.length * step * 1.3
    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </linearGradient>
            </defs>
            <path className="ad-spark-area" d={area} fill={`url(#${gid})`} />
            <path className="ad-spark-line" style={{ '--spark-len': pathLen }} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

/* Carte stat façon Bankio — libellé, badge de tendance en haut à droite, grande valeur, légende */
export function StatCard({ label, value, trend, caption, big, accent, icon }) {
    const accentColor = accent ? (C[accent] || accent) : null
    return (
        <div className="ad-stat-card" style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : undefined}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                {icon ? (
                    <div className="ad-stat-icon" style={{ background: `${accentColor || C.navy}17`, marginBottom: 0 }}>
                        <Icon name={icon} color={accentColor || C.navy} size={18} />
                    </div>
                ) : (
                    <span className="ad-stat-label">{label}</span>
                )}
                {trend && (
                    <span className={`ad-stat-trend ${trend.dir}`}>
                        <Icon name={trend.dir === 'up' ? 'arrowUp' : 'arrowDown'} size={10} color={trend.dir === 'up' ? C.green : C.red} />
                        {trend.text}
                    </span>
                )}
            </div>
            {icon && <span className="ad-stat-label" style={{ display: 'block', marginTop: 10 }}>{label}</span>}
            <div className="ad-stat-value" style={big ? { fontSize: 30 } : undefined}>{value}</div>
            {caption && <div className="ad-stat-caption">{caption}</div>}
        </div>
    )
}

/* Barres horizontales — catégoriel, une série, libellés directs, ordre de teintes fixe */
export function BarChart({ data, unit = '' }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.map((d, i) => (
                <div key={d.label} title={`${d.label}: ${d.value}${unit}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text }}>
                            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color || CATEGORICAL[i % CATEGORICAL.length] }} />
                            {d.label}
                        </span>
                        <span style={{ color: C.muted, fontWeight: 600 }}>{d.value}{unit}</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: '#EDEAE1', overflow: 'hidden' }}>
                        <div className="ad-bar-h-anim" style={{
                            '--bar-w': `${Math.max((d.value / max) * 100, 3)}%`,
                            height: '100%', borderRadius: 999, background: d.color || CATEGORICAL[i % CATEGORICAL.length],
                            animationDelay: `${i * 90}ms`,
                        }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

/* Barres verticales monochromes façon "Monthly Financial" du modèle, avec échelle optionnelle */
export function VerticalBarChart({ data, color = C.teal, height = 180, showAxis = false, highlightMax = false }) {
    const max = Math.max(...data.map(d => d.value), 1)
    const ticks = showAxis ? Array.from({ length: 5 }, (_, i) => Math.round((max / 4) * (4 - i))) : []
    const maxIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)

    // Zones à hauteur fixe (valeur / piste des barres / libellé sur 2 lignes max) pour
    // que la base de toutes les barres soit strictement alignée, quelle que soit la
    // longueur du libellé (ex: "Carrefour Maroc" vs "Amazon").
    const VALUE_H = 18
    const LABEL_H = 32
    const GAP = 8
    const trackHeight = Math.max(height - VALUE_H - LABEL_H - GAP * 2, 24)

    return (
        <div style={{ display: 'flex', gap: 14, width: '100%' }}>
            {showAxis && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: VALUE_H + GAP + trackHeight, flexShrink: 0 }}>
                    {ticks.map(t => <span key={t} style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{t.toLocaleString('fr-FR')}</span>)}
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '3%', flex: 1, width: '100%', borderLeft: showAxis ? `1px solid ${C.border}` : 'none', paddingLeft: showAxis ? 14 : 0 }}>
                {data.map((d, i) => (
                    <div key={d.label} title={`${d.label}: ${d.value}`} style={{ flex: 1, maxWidth: 64, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ height: VALUE_H, display: 'flex', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: highlightMax && i === maxIndex ? C.navy : C.muted, whiteSpace: 'nowrap' }}>{d.value}</span>
                        </div>
                        <div style={{ height: trackHeight, marginTop: GAP, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <div className="ad-bar-anim" style={{
                                width: '100%', maxWidth: 34,
                                height: `${Math.max((d.value / max) * 100, 6)}%`,
                                background: highlightMax && i === maxIndex ? C.navy : color,
                                borderRadius: '8px 8px 3px 3px',
                                transition: 'height 0.5s ease',
                                animationDelay: `${i * 70}ms`,
                            }} />
                        </div>
                        <div style={{ height: LABEL_H, marginTop: GAP, width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <span style={{
                                fontSize: 12, color: C.muted, fontWeight: 600, textAlign: 'center', lineHeight: '15px',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                overflow: 'hidden', wordBreak: 'break-word', maxWidth: '100%',
                            }}>{d.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* Anneau segmenté avec marqueurs et pourcentages — catégoriel, ordre de teintes fixe */
export function DonutChart({ data, size = 176, centerLabel = 'total' }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1
    const r = size / 2, stroke = size * 0.15, cRadius = r - stroke / 2
    const circumference = 2 * Math.PI * cRadius
    let offset = 0
    const segments = data.map((d, i) => {
        const frac = d.value / total
        const dash = frac * circumference
        const startAngle = (offset / circumference) * 360 - 90
        const midAngle = startAngle + (dash / circumference) * 360 / 2
        const endAngle = startAngle + (dash / circumference) * 360
        const seg = { ...d, dash, startOffset: offset, midAngle, endAngle, color: d.color || CATEGORICAL[i % CATEGORICAL.length], pct: Math.round(frac * 100) }
        offset += dash
        return seg
    })
    const rad = deg => (deg * Math.PI) / 180
    const labelR = r + stroke * 0.42
    const maxLabelW = 15 + Math.max(...segments.map(s => String(s.pct).length)) * 7
    const margin = Math.ceil(labelR - r + maxLabelW / 2 + 1)
    const canvas = size + margin * 2

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <svg
                width={canvas} height={canvas}
                viewBox={`${-margin} ${-margin} ${canvas} ${canvas}`}
                style={{ flexShrink: 0 }}
                className="ad-donut-wrap"
            >
                <circle cx={r} cy={r} r={cRadius} fill="none" stroke="#EDEAE1" strokeWidth={stroke} />
                {segments.map(s => (
                    <circle
                        key={s.label}
                        className="ad-donut-seg"
                        cx={r} cy={r} r={cRadius} fill="none"
                        stroke={s.color} strokeWidth={stroke}
                        strokeDasharray={`${Math.max(s.dash - 3, 0)} ${circumference - s.dash + 3}`}
                        strokeDashoffset={-s.startOffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${r} ${r})`}
                    >
                        <title>{`${s.label}: ${s.value} (${s.pct}%)`}</title>
                    </circle>
                ))}
                {segments.map(s => {
                    const x = r + labelR * Math.cos(rad(s.midAngle))
                    const y = r + labelR * Math.sin(rad(s.midAngle))
                    const w = 15 + String(s.pct).length * 7
                    return (
                        <g key={s.label + '-lbl'}>
                            <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={11} fill="white" stroke={C.border} />
                            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="700" fill={C.text}>
                                {s.pct}%
                            </text>
                        </g>
                    )
                })}
                {segments.map(s => {
                    const x = r + cRadius * Math.cos(rad(s.endAngle))
                    const y = r + cRadius * Math.sin(rad(s.endAngle))
                    return <circle key={s.label + '-dot'} cx={x} cy={y} r={4} fill="white" stroke={s.color} strokeWidth={2} />
                })}
                <text x={r} y={r - 5} textAnchor="middle" fontSize="21" fontWeight="800" fill={C.text} fontFamily={fontTitle}>{total}</text>
                <text x={r} y={r + 14} textAnchor="middle" fontSize="10.5" fill={C.muted}>{centerLabel}</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 160 }}>
                {segments.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, borderBottom: `1px dashed ${C.border}`, paddingBottom: 7 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: C.text }}>{s.label}</span>
                        <span style={{ marginLeft: 'auto', color: C.muted, fontWeight: 600 }}>{s.value} · {s.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const STATUS_STYLES = {
    Active:    { bg: C.greenBg, color: C.green },
    Actif:     { bg: C.greenBg, color: C.green },
    Nouveau:   { bg: C.amberBg, color: C.amber },
    Verified:  { bg: '#E4ECFB', color: C.blueDark },
    Suspended: { bg: C.redBg,  color: C.red },
    active:    { bg: C.greenBg, color: C.green },
    blocked:   { bg: C.redBg,  color: C.red },
    expired:   { bg: C.amberBg, color: C.amber },
    accepted:  { bg: C.greenBg, color: C.green },
    refused:   { bg: C.redBg,  color: C.red },
    suspicious:{ bg: C.amberBg, color: C.amber },
    fraud:     { bg: C.redBg,  color: C.red },
    expiration:{ bg: C.amberBg, color: C.amber },
    security:  { bg: C.redBg,  color: C.red },
    admin:     { bg: '#EDE9FE', color: C.purple },
    client:    { bg: '#E4ECFB', color: C.blueDark },
}

export const sharedCss = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    .ad-shell { display: flex; min-height: 100vh; background: ${C.bg}; font-family: ${font}; }
    .ad-sidebar {
        width: 260px; background: ${C.white}; border-right: 1px solid ${C.border};
        display: flex; flex-direction: column; padding: 1.4rem 1.1rem; position: sticky; top: 0; height: 100vh;
    }
    .ad-logo { display: flex; align-items: center; gap: 10px; padding: 0.2rem 0.3rem 1.5rem; flex-shrink: 0; }
    .ad-nav-scroll {
        flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;
        display: flex; flex-direction: column;
    }
    .ad-nav-scroll::-webkit-scrollbar { display: none; }
    .ad-nav-group-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: ${C.muted}; text-transform: uppercase; padding: 0 0.7rem; margin: 1.1rem 0 0.5rem; flex-shrink: 0; }
    .ad-nav-group-label:first-of-type { margin-top: 0; }
    .ad-nav { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
    .ad-nav-item {
        display: flex; align-items: center; gap: 12px; padding: 0.68rem 0.85rem;
        border-radius: 11px; cursor: pointer; font-size: 14px; font-weight: 600;
        color: ${C.text}; transition: background 0.15s ease, color 0.15s ease; border: none; background: none; width: 100%; text-align: left; font-family: ${font};
        text-decoration: none;
    }
    .ad-nav-item:hover { background: ${C.bg}; }
    .ad-nav-item.active { background: ${C.navy}; color: white; box-shadow: 0 4px 14px rgba(11,59,54,0.25); }
    .ad-admin-card {
        display: flex; align-items: center; gap: 10px; padding: 0.7rem;
        border-radius: 14px; background: ${C.bg}; margin-top: 0.75rem; border: 1px solid ${C.border};
    }
    .ad-balance {
        margin-top: 0.7rem; padding: 1rem; border-radius: 16px;
        background: ${C.navy};
        color: ${C.white};
    }
    .ad-main { flex: 1; padding: 1.75rem 1.25rem; min-width: 0; }
    .ad-topbar {
        display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; gap: 1.5rem;
        flex-wrap: wrap; background: ${C.white}; border: 1px solid ${C.border}; border-radius: 20px; padding: 1.6rem 1.2rem;
    }
    .ad-avatar {
        width: 44px; height: 44px; border-radius: 50%; background: ${C.navy};
        display: flex; align-items: center; justify-content: center; color: ${C.white};
        font-weight: 700; font-size: 15px; cursor: pointer; border: none; flex-shrink: 0;
        transition: transform 0.15s ease;
    }
    .ad-avatar:hover { transform: scale(1.06); }
    .ad-bell {
        width: 44px; height: 44px; border-radius: 50%; border: 1px solid ${C.border};
        display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;
        background: ${C.white}; text-decoration: none; transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }
    .ad-bell:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(27,35,64,0.12); border-color: ${C.blue}; }
    .ad-bell:active { transform: translateY(0) scale(0.96); }
    .ad-badge {
        position: absolute; top: -3px; right: -3px; background: ${C.red}; color: white;
        font-size: 10px; font-weight: 700; border-radius: 50%; width: 17px; height: 17px;
        display: flex; align-items: center; justify-content: center; border: 2px solid ${C.white};
    }
    .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.1rem; margin-bottom: 1.5rem; }
    .ad-hero-grid { display: grid; grid-template-columns: 1fr 1.35fr 1fr; gap: 1.1rem; margin-bottom: 1.25rem; align-items: stretch; }
    .ad-hero-stack { display: flex; flex-direction: column; gap: 1.1rem; }
    .ad-hero-stack .ad-stat-card:nth-child(1) { animation-delay: 0.03s; }
    .ad-hero-stack .ad-stat-card:nth-child(2) { animation-delay: 0.1s; }
    .ad-hero-wide {
        background: ${C.white}; border-radius: 20px; border: 1px solid ${C.border}; padding: 1.3rem 1.4rem;
        box-shadow: 0 2px 12px rgba(27,35,64,0.06); display: flex; flex-direction: column; gap: 14px; justify-content: space-between;
        border-top: 3px solid ${C.blue};
    }
    .ad-hero-dark {
        background: ${C.navy}; color: white; border-radius: 20px; padding: 1.3rem 1.4rem;
        display: flex; flex-direction: column; justify-content: space-between; gap: 10px;
        transition: transform 0.2s ease, box-shadow 0.2s ease; animation: adFadeUp 0.4s ease backwards;
    }
    .ad-hero-dark:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(27,35,64,0.28); }
    .ad-hero-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .ad-hero-divider { height: 1px; background: ${C.border}; margin: 2px 0; }
    .ad-table-dark thead th {
        background: ${C.navy}; color: white; border: none; padding: 0.85rem 0.9rem;
        text-transform: none; font-size: 12.5px; letter-spacing: 0; font-weight: 600;
    }
    .ad-table-dark thead tr th:first-child { border-radius: 12px 0 0 12px; }
    .ad-table-dark thead tr th:last-child { border-radius: 0 12px 12px 0; }
    .ad-stat-card {
        background: ${C.white}; border-radius: 18px; padding: 1.3rem 1.4rem;
        border: 1px solid ${C.border}; box-shadow: 0 2px 10px rgba(27,35,64,0.06);
        transition: transform 0.2s ease, box-shadow 0.2s ease; animation: adFadeUp 0.4s ease backwards;
    }
    .ad-stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(27,35,64,0.12); }
    .ad-stat-label { font-size: 13px; color: ${C.muted}; font-weight: 600; }
    .ad-stat-value { font-size: 27px; font-weight: 800; font-family: ${fontTitle}; color: ${C.text}; margin-top: 10px; letter-spacing: -0.3px; }
    .ad-stat-caption { font-size: 12px; color: ${C.muted}; margin-top: 6px; }
    .ad-stat-trend {
        display: inline-flex; align-items: center; gap: 3px; font-size: 11.5px; font-weight: 700;
        padding: 3px 8px 3px 6px; border-radius: 999px; white-space: nowrap;
    }
    .ad-stat-trend.up { background: ${C.greenBg}; color: ${C.green}; }
    .ad-stat-trend.down { background: ${C.redBg}; color: ${C.red}; }
    .ad-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.85rem; }
    .ad-content-grid { display: grid; grid-template-columns: 2.15fr 1fr; gap: 1.25rem; align-items: start; }
    .ad-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start; }
    .ad-panel {
        background: ${C.white}; border-radius: 20px; border: 1px solid ${C.border};
        padding: 1.5rem; box-shadow: 0 2px 12px rgba(27,35,64,0.06);
        animation: adFadeUp 0.45s ease backwards; transition: box-shadow 0.2s ease;
    }
    .ad-search {
        display: flex; align-items: center; gap: 8px; border: 1.5px solid ${C.border};
        border-radius: 12px; padding: 0.65rem 0.9rem; flex: 1; background: ${C.bg};
    }
    .ad-search input { border: none; outline: none; background: transparent; font-size: 14px; width: 100%; font-family: ${font}; color: ${C.text}; }
    .ad-select, .ad-filter-btn {
        display: flex; align-items: center; gap: 8px; border: 1.5px solid ${C.border};
        border-radius: 12px; padding: 0.65rem 1rem; font-size: 14px; font-weight: 600;
        color: ${C.text}; background: ${C.white}; cursor: pointer; white-space: nowrap; font-family: ${font};
        transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .ad-filter-btn:hover { transform: translateY(-1px); border-color: ${C.blue}; }
    .ad-filter-btn.on { background: ${C.navy}; color: white; border-color: ${C.navy}; }
    table.ad-table { width: 100%; border-collapse: collapse; margin-top: 1.25rem; }
    .ad-table th {
        text-align: left; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.03em;
        color: ${C.muted}; font-weight: 700; padding: 0 0.6rem 0.75rem; border-bottom: 1px solid ${C.border};
    }
    .ad-table td { padding: 0.9rem 0.6rem; border-bottom: 1px solid ${C.border}; font-size: 14.5px; color: ${C.text}; }
    .ad-table tbody tr { transition: background 0.15s ease; }
    .ad-table tbody tr:hover { background: ${C.bg}; }
    .ad-status-pill { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 12.5px; font-weight: 700; display: inline-block; text-transform: capitalize; }
    .ad-status-text { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; text-transform: capitalize; }
    .ad-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .ad-row-avatar { width: 36px; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12.5px; font-weight: 700; flex-shrink: 0; }
    .ad-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; flex-wrap: wrap; gap: 10px; }
    .ad-page-btn {
        width: 34px; height: 34px; border-radius: 10px; border: 1px solid ${C.border};
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        font-size: 13.5px; font-weight: 600; color: ${C.text}; background: ${C.white};
        transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    }
    .ad-page-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: ${C.blue}; }
    .ad-page-btn:active:not(:disabled) { transform: translateY(0) scale(0.94); }
    .ad-page-btn.active { background: ${C.navy}; color: white; border-color: ${C.navy}; }
    .ad-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .ad-form-label { font-size: 13.5px; font-weight: 700; color: ${C.text}; margin: 1rem 0 0.4rem; display: block; }
    .ad-form-input, .ad-form-select {
        width: 100%; border: 1.5px solid ${C.border}; border-radius: 12px; padding: 0.75rem 0.9rem;
        font-size: 14px; font-family: ${font}; outline: none; color: ${C.text}; background: ${C.white};
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .ad-form-input:focus, .ad-form-select:focus { border-color: ${C.blue}; box-shadow: 0 0 0 3px ${C.blue}22; }
    .ad-form-select-btn {
        width: 100%; border: 1.5px solid ${C.border}; border-radius: 12px; padding: 0.75rem 0.9rem;
        font-size: 14px; font-family: ${font}; color: ${C.text}; background: ${C.white};
        display: flex; align-items: center; justify-content: space-between; cursor: pointer;
    }
    .ad-toggle { width: 42px; height: 24px; border-radius: 999px; position: relative; cursor: pointer; flex-shrink: 0; border: none; transition: background 0.15s ease; }
    .ad-toggle::after {
        content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: white;
        top: 3px; transition: right 0.15s ease, left 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .ad-toggle.on { background: ${C.teal}; }
    .ad-toggle.on::after { right: 3px; }
    .ad-toggle.off { background: #D9D5C8; }
    .ad-toggle.off::after { left: 3px; }
    .ad-issue-btn {
        width: 100%; margin-top: 1.25rem; padding: 0.9rem; border: none; border-radius: 13px;
        background: ${C.navy}; color: white; font-weight: 700;
        font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
        box-shadow: 0 8px 20px rgba(11,59,54,0.22); font-family: ${font};
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ad-issue-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(11,59,54,0.3); }
    .ad-issue-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
    .ad-issue-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .ad-btn-outline {
        padding: 0.65rem 1.1rem; border-radius: 12px; border: 1.5px solid ${C.border}; background: ${C.white};
        color: ${C.text}; font-weight: 600; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; gap: 8px;
        font-family: ${font}; transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    }
    .ad-btn-outline:hover { background: ${C.bg}; border-color: ${C.blue}; transform: translateY(-2px); }
    .ad-btn-outline:active { transform: translateY(0) scale(0.97); }
    .ad-icon-btn { border: none; background: none; cursor: pointer; padding: 4px; display: flex; border-radius: 6px; transition: transform 0.15s ease, background 0.15s ease; }
    .ad-icon-btn:hover { background: ${C.bg}; transform: scale(1.08); }
    .ad-icon-btn:active { transform: scale(0.94); }
    .ad-menu {
        position: absolute; right: 0; top: 100%; margin-top: 4px; background: white; border: 1px solid ${C.border};
        border-radius: 12px; box-shadow: 0 8px 24px rgba(35,38,31,0.12); z-index: 10; min-width: 190px; overflow: hidden;
    }
    .ad-menu-item {
        padding: 0.65rem 0.9rem; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; gap: 8px;
        color: ${C.text}; background: none; border: none; width: 100%; text-align: left; font-family: ${font};
    }
    .ad-menu-item:hover { background: ${C.bg}; }
    .ad-picker-item { padding: 0.65rem 0.9rem; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; }
    .ad-picker-item:hover { background: ${C.bg}; }
    .ad-alert-banner { padding: 0.8rem 1rem; border-radius: 12px; font-size: 13.5px; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
    .ad-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .ad-tab { padding: 0.55rem 1rem; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; background: none; color: ${C.muted}; font-family: ${font}; transition: background 0.15s ease, color 0.15s ease; }
    .ad-tab:hover { color: ${C.navy}; }
    .ad-tab.active { background: ${C.white}; color: ${C.navy}; box-shadow: 0 1px 3px rgba(35,38,31,0.08); }
    .ad-tabs { display: flex; gap: 4px; background: ${C.bg}; padding: 4px; border-radius: 12px; width: fit-content; }
    .ad-accordion-item { border-bottom: 1px solid ${C.border}; }
    .ad-accordion-head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; cursor: pointer; font-weight: 700; color: ${C.text}; font-size: 14.5px; }
    .ad-status-pill { transition: transform 0.15s ease; }
    .ad-status-pill:hover { transform: scale(1.05); }
    .ad-bar-anim { transform-origin: bottom; animation: adBarGrow 0.65s cubic-bezier(0.16,1,0.3,1) backwards; }
    @keyframes adBarGrow { from { transform: scaleY(0); opacity: 0.35; } to { transform: scaleY(1); opacity: 1; } }
    .ad-bar-h-anim { width: var(--bar-w); animation: adBarGrowH 0.7s cubic-bezier(0.16,1,0.3,1) backwards; }
    @keyframes adBarGrowH { from { width: 0; opacity: 0.4; } to { width: var(--bar-w); opacity: 1; } }
    .ad-donut-wrap { animation: adDonutIn 0.6s cubic-bezier(0.16,1,0.3,1) backwards; transform-origin: center; }
    @keyframes adDonutIn { from { opacity: 0; transform: scale(0.85) rotate(-8deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
    .ad-donut-seg { transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer; }
    .ad-donut-seg:hover { opacity: 0.8; }
    .ad-spark-line { stroke-dasharray: var(--spark-len); stroke-dashoffset: var(--spark-len); animation: adSparkDraw 1.1s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes adSparkDraw { to { stroke-dashoffset: 0; } }
    .ad-spark-area { animation: adFadeUp 0.8s ease 0.3s backwards; }
    @keyframes adFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1200px) {
        .ad-stats { grid-template-columns: repeat(2, 1fr); }
        .ad-content-grid { grid-template-columns: 1fr; }
        .ad-grid-2 { grid-template-columns: 1fr; }
        .ad-hero-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 800px) {
        .ad-sidebar { display: none; }
        .ad-stats { grid-template-columns: 1fr; }
    }
`
