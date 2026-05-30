import { useState, useEffect } from 'react'
import { generateInvite } from '../../lib/anthropic'
import { displayDate, formatTime, PARTNER_EMAIL } from '../../lib/helpers'

function Spinner({ text }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-9 h-9 rounded-full anim-spin" style={{ border:'3px solid #4c1d95', borderTopColor:'#a78bfa' }} />
      {text && <p className="text-purple-400 text-sm anim-pulse">{text}</p>}
    </div>
  )
}

export default function InvitationModal({ booking, userEmail, onClose, onSaved, showToast }) {
  const [text,       setText]       = useState(booking.invitation_message || '')
  const [loading,    setLoading]    = useState(!booking.invitation_message)
  const [error,      setError]      = useState('')
  const [copied,     setCopied]     = useState(false)
  const [sending,    setSending]    = useState(false)

  const partnerEmail = PARTNER_EMAIL(userEmail)

  const generate = async () => {
    setLoading(true); setError(''); setText('')
    try {
      const msg = await generateInvite(booking)
      setText(msg)
      await onSaved(booking.id, msg)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { if (!booking.invitation_message) generate() }, [])

  const copy = () => {
    const full = `${text}\n\n📅 ${displayDate(booking.date)}${booking.time ? `\n⏰ ${formatTime(booking.time)}` : ''}${booking.location ? `\n📍 ${booking.location}` : ''}`
    navigator.clipboard.writeText(full).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200) })
  }

  const sendEmail = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking, invitationText: text }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Send failed')
      showToast('Invitation sent! 💌', 'success')
      onClose()
    } catch(e) {
      showToast(`Failed to send: ${e.message}`, 'error')
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
         style={{ background:'rgba(5,1,18,.9)' }}>
      <div className="anim-slide w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
           style={{ background:'linear-gradient(160deg,#2d1065,#160530)', border:'1px solid #7c3aed50' }}>

        <div className="px-6 pt-6 pb-4" style={{ borderBottom:'1px solid rgba(124,58,237,.2)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-400 text-xs uppercase tracking-widest font-semibold mb-1">💌 Invitation</p>
              <h3 className="font-serif-display text-white text-lg">{booking.event_name}</h3>
              <p className="text-purple-500 text-xs mt-0.5">
                {new Date(booking.date+'T12:00').toLocaleDateString('en-AU',{weekday:'short',year:'numeric',month:'long',day:'numeric'})}
                {booking.time ? ` · ${formatTime(booking.time)}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-purple-500 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-800/50 transition-all">×</button>
          </div>
        </div>

        <div className="px-6 py-5">
          {loading && <Spinner text="Crafting your invitation…" />}

          {error && (
            <div className="text-center py-4">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button onClick={generate} className="text-purple-300 hover:text-white text-sm underline">Try again</button>
            </div>
          )}

          {text && !loading && (
            <div className="space-y-4">
              <div className="relative rounded-2xl p-6 overflow-hidden"
                   style={{ background:'rgba(124,58,237,.15)', border:'1px solid rgba(167,139,250,.25)' }}>
                <span className="absolute top-3 right-4 text-3xl opacity-15 select-none">💜</span>
                <span className="absolute bottom-3 left-4 text-2xl opacity-15 select-none">✨</span>
                <p className="text-center text-[10px] uppercase tracking-widest text-purple-500 font-semibold mb-4">— With Love —</p>
                <p className="font-serif-display text-purple-100 text-sm leading-relaxed italic relative z-10">"{text}"</p>
                <div className="mt-5 pt-4 text-center space-y-1" style={{ borderTop:'1px solid rgba(124,58,237,.25)' }}>
                  <p className="text-purple-400 text-xs">📅 {displayDate(booking.date)}</p>
                  {booking.time     && <p className="text-purple-400 text-xs">⏰ {formatTime(booking.time)}</p>}
                  {booking.location && <p className="text-purple-400 text-xs">📍 {booking.location}</p>}
                </div>
              </div>

              <p className="text-purple-600 text-xs text-center">Sending to: {partnerEmail}</p>

              <div className="flex gap-2 flex-wrap">
                <button onClick={generate}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-purple-400 border border-purple-800 hover:bg-purple-900/30 transition-all">
                  ↺ Regenerate
                </button>
                <button onClick={copy}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: copied ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#4c1d95,#6d28d9)' }}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button onClick={sendEmail} disabled={sending}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                  {sending ? 'Sending…' : '💌 Send Invitation to Arpana'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
