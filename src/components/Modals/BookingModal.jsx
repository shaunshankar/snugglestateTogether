import { useState } from 'react'
import { displayDate } from '../../lib/helpers'

export default function BookingModal({ date, existing, onSave, onDelete, onClose, saving }) {
  const [form, setForm] = useState({
    event_name: existing?.event_name || '',
    time:       existing?.time       || '',
    location:   existing?.location   || '',
    notes:      existing?.notes      || '',
  })
  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const editing = !!existing

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
         style={{ background:'rgba(5,1,18,.88)' }}>
      <div className="anim-slide w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
           style={{ background:'linear-gradient(160deg,#2d1065,#160530)', border:'1px solid #7c3aed50' }}>

        <div className="px-6 pt-6 pb-4" style={{ borderBottom:'1px solid rgba(124,58,237,.2)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-400 text-xs uppercase tracking-widest font-semibold mb-1">
                {editing ? 'Edit Date ✏️' : 'Book a Date 💕'}
              </p>
              <h3 className="font-serif-display text-white text-lg leading-tight">{displayDate(date)}</h3>
            </div>
            <button onClick={onClose} className="text-purple-500 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-800/50 transition-all">×</button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-purple-400 text-[11px] uppercase tracking-widest font-semibold mb-1.5">Activity / Event *</label>
            <input type="text" value={form.event_name} onChange={e => set('event_name')(e.target.value)}
                   placeholder="e.g. Dinner at our favourite restaurant"
                   className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-700"
                   style={{ background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.35)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-purple-400 text-[11px] uppercase tracking-widest font-semibold mb-1.5">Time</label>
              <input type="time" value={form.time} onChange={e => set('time')(e.target.value)}
                     className="w-full rounded-xl px-4 py-2.5 text-sm text-white"
                     style={{ background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.35)', colorScheme:'dark' }} />
            </div>
            <div>
              <label className="block text-purple-400 text-[11px] uppercase tracking-widest font-semibold mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={e => set('location')(e.target.value)}
                     placeholder="Where?"
                     className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-700"
                     style={{ background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.35)' }} />
            </div>
          </div>
          <div>
            <label className="block text-purple-400 text-[11px] uppercase tracking-widest font-semibold mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes')(e.target.value)}
                      placeholder="Any special details…" rows={2}
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-700 resize-none"
                      style={{ background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.35)' }} />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          {editing && (
            <button onClick={() => onDelete(existing.id)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/50 border border-red-900/50 transition-all">Delete</button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-purple-400 border border-purple-800 hover:bg-purple-900/30 transition-all">Cancel</button>
          <button onClick={() => form.event_name.trim() && onSave({ date, ...form })}
                  disabled={!form.event_name.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Book It! 💕'}
          </button>
        </div>
      </div>
    </div>
  )
}
