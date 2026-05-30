import { supabase } from '../lib/supabase'

export default function Header({ user, rosterCount, offCount, bookedCount }) {
  const logout = () => supabase.auth.signOut()

  return (
    <header className="sticky top-0 z-30 px-4 py-3"
            style={{ background:'rgba(8,2,18,.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(124,58,237,.15)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
               style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            💜
          </div>
          <div>
            <h1 className="font-serif-display text-white font-semibold leading-tight text-base sm:text-lg">Snuggle State</h1>
            <p className="font-serif-display text-purple-500 italic text-xs leading-none">— Together</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {rosterCount > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-purple-500">
              <span>📋 {rosterCount}</span>
              <span>✨ {offCount} free</span>
              <span>💕 {bookedCount} booked</span>
            </div>
          )}
          <span className="text-purple-600 text-xs hidden md:block truncate max-w-40">{user?.email}</span>
          <button onClick={logout}
                  className="text-purple-600 hover:text-purple-300 text-xs px-3 py-1.5 rounded-lg border border-purple-900 hover:border-purple-600 transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
