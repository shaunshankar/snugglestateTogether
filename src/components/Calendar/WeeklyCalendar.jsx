import { useMemo } from 'react'
import { SHIFT, DAYS_SHORT, toKey, todayKey, formatTime } from '../../lib/helpers'

export default function WeeklyCalendar({ year, month, roster, bookings, onDay, weekOffset, onWeek }) {
  const rMap = useMemo(() => Object.fromEntries(roster.map(r => [r.date, r])), [roster])
  const bMap = useMemo(() => Object.fromEntries(bookings.map(b => [b.date, b])), [bookings])
  const today = todayKey()

  const anchor = useMemo(() => {
    const base = new Date(year, month, 1)
    base.setDate(base.getDate() - base.getDay() + weekOffset * 7)
    return base
  }, [year, month, weekOffset])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor); d.setDate(d.getDate() + i); return d
  })

  const rangeLabel = `${days[0].toLocaleDateString('en-AU',{day:'numeric',month:'short'})} — ${days[6].toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}`

  return (
    <div className="anim-fade">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onWeek(-1)} className="text-purple-400 hover:text-white text-sm px-3 py-1.5 rounded-xl hover:bg-purple-800/40 transition-all">← Prev</button>
        <span className="text-purple-200 text-sm font-medium">{rangeLabel}</span>
        <button onClick={() => onWeek(1)}  className="text-purple-400 hover:text-white text-sm px-3 py-1.5 rounded-xl hover:bg-purple-800/40 transition-all">Next →</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const key = toKey(day)
          const r = rMap[key]; const b = bMap[key]
          const cfg = r ? SHIFT[r.shift] : null
          const isOff = r?.shift === 'off'
          const isToday = key === today
          const inMonth = day.getMonth() === month

          return (
            <div key={key}
                 className={`day-cell rounded-xl p-2 flex flex-col min-h-28 ${isOff ? 'bookable' : ''}`}
                 style={{
                   background: cfg ? cfg.softBg : inMonth ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.015)',
                   border: isToday ? '2px solid #a855f7' : cfg ? `1px solid ${cfg.bg}40` : '1px solid rgba(255,255,255,.07)',
                   opacity: inMonth ? 1 : 0.4,
                 }}
                 onClick={() => isOff && onDay(key, b)}>

              <div className="text-center mb-1">
                <div className="text-[10px] font-semibold text-purple-500 uppercase">{DAYS_SHORT[day.getDay()]}</div>
                <div className="text-xl font-bold mt-0.5" style={{ color: isToday ? '#a78bfa' : cfg?.textDark || '#a78bfa' }}>{day.getDate()}</div>
              </div>

              {cfg && (
                <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-2xl">{cfg.emoji}</span>
                  <span className="text-[10px] font-semibold" style={{ color: cfg.textDark }}>{cfg.label}</span>
                  {r.startTime && <span className="text-[10px] opacity-60" style={{ color: cfg.bg }}>{formatTime(r.startTime)}{r.endTime ? `–${formatTime(r.endTime)}` : ''}</span>}
                </div>
              )}

              {b && (
                <div className="mt-auto rounded-md px-1 py-0.5 text-[10px] font-semibold text-white text-center truncate" style={{ background:'#7c3aed' }}>
                  💕 {b.event_name}
                </div>
              )}
            </div>
          )
        })}
      </div>

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
