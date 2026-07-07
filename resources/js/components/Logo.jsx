import React from 'react'
import { fontTitle } from '../admin/theme'

export default function Logo({ size = 20, color = '#111111' }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'baseline',
            fontFamily: fontTitle, fontWeight: 800, fontSize: size,
            color, letterSpacing: '-0.5px', lineHeight: 1,
        }}>
            CardFlow
            <span style={{
                marginLeft: 2,
                fontWeight: 800,
                background: 'linear-gradient(180deg, #E63946 0%, #F4A341 55%, #F5C518 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>/</span>
        </span>
    )
}
