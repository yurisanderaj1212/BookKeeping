'use client'

import { useEffect, useState } from 'react'

const BARS = [
  { label: 'MON', pct: 28,  active: false },
  { label: 'TUE', pct: 45,  active: false },
  { label: 'WED', pct: 72,  active: false },
  { label: 'THU', pct: 38,  active: false },
  { label: 'FRI', pct: 60,  active: false },
  { label: 'SAT', pct: 100, active: true  },
  { label: 'SUN', pct: 35,  active: false },
]

const STATS = [
  { label: 'Total Revenue',    value: '$1,429,203', change: '+24.8%', up: true  },
  { label: 'Active Businesses', value: '10,000+',   change: '+12.3%', up: true  },
  { label: 'Transactions',     value: '2M+',        change: '+8.1%',  up: true  },
  { label: 'Satisfaction',     value: '98%',        change: '+0.4%',  up: true  },
]

export default function AuthFlipCard() {
  const [flipped, setFlipped]     = useState(false)
  const [statIdx, setStatIdx]     = useState(0)
  const [barsIn, setBarsIn]       = useState(false)

  // Animate bars in on mount
  useEffect(() => {
    const t = setTimeout(() => setBarsIn(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Flip every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped(f => {
        if (f) {
          // Going back to chart side — advance stat for next flip
          setStatIdx(i => (i + 1) % STATS.length)
        }
        return !f
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const stat = STATS[statIdx]

  return (
    <div
      className="w-full max-w-sm mx-auto"
      style={{ perspective: '1200px' }}
    >
      <div
        style={{
          position:        'relative',
          width:           '100%',
          height:          '320px',
          transformStyle:  'preserve-3d',
          transition:      'transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          transform:       flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── Front: Bar Chart ── */}
        <div
          style={{
            position:         'absolute',
            inset:            0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius:     '1rem',
            padding:          '1.75rem',
            background:       'rgba(13, 15, 20, 0.9)',
            border:           '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.25em] mb-1">Global Revenue</p>
              <p className="text-[#81ecff] text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                $1,429,203.00
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f4ffc6] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f4ffc6]" />
              </span>
              <span className="text-[#f4ffc6] text-[9px] font-bold uppercase tracking-[0.2em]">Live</span>
            </div>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between gap-2" style={{ height: '140px' }}>
            {BARS.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                <div className="w-full flex items-end" style={{ height: '110px' }}>
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height:     barsIn ? `${bar.pct}%` : '0%',
                      background: bar.active ? '#81ecff' : 'rgba(255,255,255,0.1)',
                      boxShadow:  bar.active ? '0 0 16px rgba(129,236,255,0.5)' : 'none',
                      transition: `height 0.8s cubic-bezier(0.34,1.2,0.64,1) ${i * 70}ms`,
                    }}
                  />
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${bar.active ? 'text-[#81ecff]' : 'text-white/20'}`}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Back: Stat Card ── */}
        <div
          style={{
            position:         'absolute',
            inset:            0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform:        'rotateY(180deg)',
            borderRadius:     '1rem',
            padding:          '1.75rem',
            background:       'rgba(13, 15, 20, 0.9)',
            border:           '1px solid rgba(129,236,255,0.15)',
            display:          'flex',
            flexDirection:    'column',
            justifyContent:   'center',
            alignItems:       'center',
            gap:              '1rem',
          }}
        >
          {/* Glow */}
          <div
            style={{
              position:     'absolute',
              inset:        0,
              borderRadius: '1rem',
              background:   'radial-gradient(circle at 50% 50%, rgba(129,236,255,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] text-center">
            {stat.label}
          </p>
          <p
            className="text-[#81ecff] font-bold text-center"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize:   '3rem',
              lineHeight: 1,
            }}
          >
            {stat.value}
          </p>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: stat.up ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
                color:      stat.up ? '#34d399' : '#ef4444',
              }}
            >
              <span>{stat.up ? '↑' : '↓'}</span>
              <span>{stat.change}</span>
            </div>
            <span className="text-white/30 text-xs">vs last year</span>
          </div>

          {/* Mini dots indicator */}
          <div className="flex gap-1.5 mt-2">
            {STATS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === statIdx ? '16px' : '6px',
                  height:     '6px',
                  background: i === statIdx ? '#81ecff' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
