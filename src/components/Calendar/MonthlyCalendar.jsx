import { useMemo } from 'react'
import { SHIFT, DAYS_SHORT, toKey, todayKey, daysInMonth, firstDayOfMonth, formatTime } from '../../lib/helpers'

export default function MonthlyCalendar({ year, month, roster, bookings, onDay }) {
  const rMap = useMemo(() => Object.fromEntries(roster.map(r => [r.date, r])), [roster])
  const bMap = useMemo(() => Object.fromEntries(bookings.map(b => [b.date, b])), [bookings])
  const today = todayKey()

  const cells = []
  const first = firstDayOfMonth(year, month)
  for (let i = 0; i < first; i++) cells.push(<div key={`pad${i}`} />)

  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const r = rMap[key]
    const b = bMap[key]
    const cfg = r ? SHIFT[r.shift] : null
    const isOff = r?.shift === 'off'
    const isToday = key === today

    cells.push(
      <div key={key}
           className={`day-cell rounded-xl p-2 relative min-h-16 ${isOff ? 'bookable' : ''}`}
           style={{
             background: cfg ? cfg.softBg : 'rgba(255,255,255,.03)',
             border: isToday ? '2px solid #a855f7' : cfg ? `1px solid ${cfg.bg}35` : '1px solid rgba(255,255,255,.05)',
           }}
           onClick={() => isOff && onDay(key, b)}>

        <div className="flex items-start justify-between mb-0.5">
          <span className={`text-xs font-bold leading-none ${isToday ? 'bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]' : ''}`}
                style={{ color: isToday ? undefined : cfg?.textDark || '#a78bfa' }}>
            {d}
          </span>
          {cfg && <span className="text-sm leading-none">{cfg.emoji}</span>}
        </div>

        {cfg && <p className="text-[10px] font-semibold truncate leading-tight" style={{ color: cfg.textDark }}>{cfg.label}</p>}
        {r?.startTime && <p className="text-[10px] leading-tight opacity-60" style={{ color: cfg?.bg }}>{formatTime(r.startTime)}</p>}

        {b && (
          <div className="mt-1 rounded-md px-1 py-0.5 text-[10px] font-semibold truncate text-white" style={{ background:'#7c3aed' }}>
            💕 {b.event_name}
          </div>
        )}

        {isOff && !b && (
          <div className="absolute inset-x-0 bottom-0 pb-1 flex justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">+ Book</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="anim-fade">
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-purple-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
      <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop:'1px solid rgba(124,58,237,.15)' }}>
        {Object.entries(SHIFT).map(([k,c]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.bg }} />
            <span className="text-xs text-purple-400">{c.emoji} {c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
