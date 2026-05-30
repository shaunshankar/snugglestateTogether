import { useMemo } from 'react'
import { todayKey, formatTime } from '../../lib/helpers'

export default function UpcomingBookings({ bookings, onEdit, onInvite }) {
  const upcoming = useMemo(() =>
    bookings
      .filter(b => b.date >= todayKey())
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(0, 6),
  [bookings])

  if (!upcoming.length) return null

  return (
    <div className="rounded-2xl p-5 anim-fade"
         style={{ background:'rgba(124,58,237,.08)', border:'1px solid rgba(124,58,237,.2)' }}>
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-base">💕 Upcoming Dates</h3>
      <div className="space-y-2">
        {upcoming.map(b => (
          <div key={b.id}
               className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-purple-900/30 cursor-pointer"
               style={{ background:'rgba(124,58,237,.15)' }}
               onClick={() => onEdit(b)}>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{b.event_name}</p>
              <p className="text-purple-400 text-xs mt-0.5">
                {new Date(b.date+'T12:00').toLocaleDateString('en-AU',{weekday:'short',month:'short',day:'numeric'})}
                {b.time ? ` · ${formatTime(b.time)}` : ''}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onInvite(b) }}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg border text-purple-300 hover:text-white border-purple-700 hover:border-purple-400 transition-all">
              💌
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
