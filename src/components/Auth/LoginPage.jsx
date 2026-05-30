import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ALLOWED_EMAILS } from '../../lib/helpers'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!ALLOWED_EMAILS.includes(trimmed)) {
      setError('This app is private. Only authorised partners can access it.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email: trimmed, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(155deg,#0d0620 0%,#1a0838 55%,#080114 100%)' }}>
      <div className="anim-slide w-full max-w-sm rounded-3xl p-8 text-center"
           style={{ background:'linear-gradient(155deg,#2d1065,#1a0840)', border:'1px solid #7c3aed40' }}>

        <div className="anim-heart text-5xl mb-5 inline-block">💜</div>

        <h1 className="font-serif-display text-white text-3xl mb-1">Snuggle State</h1>
        <p className="font-serif-display text-purple-400 italic text-base mb-8">— Together</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-purple-400 text-xs uppercase tracking-widest font-semibold mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-purple-700"
              style={{ background:'rgba(124,58,237,.15)', border:'1px solid #7c3aed60' }}
            />
          </div>
          <div>
            <label className="block text-purple-400 text-xs uppercase tracking-widest font-semibold mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-purple-700"
              style={{ background:'rgba(124,58,237,.15)', border:'1px solid #7c3aed60' }}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-950/40 rounded-xl px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            {loading ? 'Signing in…' : 'Sign In ✨'}
          </button>
        </form>

        <p className="text-purple-800 text-xs mt-6">This is a private app for two 💜</p>
      </div>
    </div>
  )
}
