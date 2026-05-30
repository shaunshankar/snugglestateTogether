import { SHIFT } from '../../lib/helpers'

export default function ShiftStats({ roster }) {
  if (!roster.length) return null
  return (
    <div className="grid grid-cols-2 gap-2 anim-fade">
      {Object.entries(SHIFT).map(([key, cfg]) => {
        const n = roster.filter(r => r.shift === key).length
        return (
          <div key={key} className="rounded-xl p-3 text-center"
               style={{ background: cfg.softBg, border:`1px solid ${cfg.bg}30` }}>
            <div className="text-xl mb-0.5">{cfg.emoji}</div>
            <div className="text-lg font-bold" style={{ color: cfg.bg }}>{n}</div>
            <div className="text-xs font-medium" style={{ color: cfg.textDark }}>{cfg.label}</div>
          </div>
        )
      })}
    </div>
  )
}
