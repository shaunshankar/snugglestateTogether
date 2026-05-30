import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { parseRoster } from './lib/anthropic'
import { MONTHS_LONG, todayKey } from './lib/helpers'

import LoginPage        from './components/Auth/LoginPage'
import Header           from './components/Header'
import Toast            from './components/Toast'
import UploadPanel      from './components/Sidebar/UploadPanel'
import ShiftStats       from './components/Sidebar/ShiftStats'
import UpcomingBookings from './components/Sidebar/UpcomingBookings'
import MonthlyCalendar  from './components/Calendar/MonthlyCalendar'
import WeeklyCalendar   from './components/Calendar/WeeklyCalendar'
import BookingModal     from './components/Modals/BookingModal'
import InvitationModal  from './components/Modals/InvitationModal'

export default function App() {
  const [session,      setSession]      = useState(undefined) // undefined = loading
  const [roster,       setRoster]       = useState([])
  const [bookings,     setBookings]     = useState([])
  const [preview,      setPreview]      = useState(null)
  const [loadingRst,   setLoadingRst]   = useState(false)
  const [savingBook,   setSavingBook]   = useState(false)
  const [view,         setView]         = useState('monthly')
  const [weekOffset,   setWeekOffset]   = useState(0)
  const [toast,        setToast]        = useState(null)
  const [bookingModal, setBookingModal] = useState(null) // { date, existing? }
  const [inviteModal,  setInviteModal]  = useState(null) // booking object
  const [navDate,      setNavDate]      = useState(new Date())

  const showToast = (message, type='info') => setToast({ message, type })

  // ── Auth ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch data ────────────────────────────────────────
  const fetchRoster = useCallback(async () => {
    const { data } = await supabase
      .from('rosters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data?.shifts) {
      setRoster(data.shifts)
      if (data.shifts.length > 0) {
        const d = new Date(data.shifts[0].date + 'T12:00')
        if (!isNaN(d)) setNavDate(d)
      }
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase.from('bookings').select('*').order('date')
    if (data) setBookings(data)
  }, [])

  useEffect(() => {
    if (!session) return
    fetchRoster()
    fetchBookings()

    // Real-time subscriptions
    const rosterSub = supabase.channel('rosters-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rosters' }, fetchRoster)
      .subscribe()

    const bookingSub = supabase.channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchBookings)
      .subscribe()

    return () => { supabase.removeChannel(rosterSub); supabase.removeChannel(bookingSub) }
  }, [session])

  // ── Roster upload ─────────────────────────────────────
  const handleUpload = async (b64, mediaType, prev) => {
    setPreview(prev)
    setLoadingRst(true)
    try {
      const shifts = await parseRoster(b64, mediaType)
      const month = shifts[0]?.date?.slice(0, 7) || new Date().toISOString().slice(0, 7)
      const { error } = await supabase.from('rosters').insert({
        uploaded_by: session.user.id,
        month,
        shifts,
      })
      if (error) throw new Error(error.message)
      setRoster(shifts)
      if (shifts.length > 0) {
        const d = new Date(shifts[0].date + 'T12:00')
        if (!isNaN(d)) setNavDate(d)
      }
      showToast(`✓ Parsed ${shifts.length} shift entries`, 'success')
    } catch(e) {
      showToast(`Roster parse failed: ${e.message}`, 'error')
    }
    setLoadingRst(false)
  }

  // ── Navigation ────────────────────────────────────────
  const navigate = dir => {
    setNavDate(d => { const n = new Date(d); n.setMonth(n.getMonth()+dir); return n })
    setWeekOffset(0)
  }
  const goToday = () => { setNavDate(new Date()); setWeekOffset(0) }

  // ── Bookings ──────────────────────────────────────────
  const openDay = (date, existing) => setBookingModal({ date, existing })

  const saveBooking = async formData => {
    setSavingBook(true)
    try {
      let saved
      if (formData.id) {
        // update
        const { data, error } = await supabase
          .from('bookings').update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', formData.id).select().single()
        if (error) throw error
        saved = data
      } else {
        const { data, error } = await supabase
          .from('bookings').insert({ ...formData, created_by: session.user.id }).select().single()
        if (error) throw error
        saved = data
      }
      setBookingModal(null)
      showToast(`Date booked for ${new Date(formData.date+'T12:00').toLocaleDateString('en-AU',{month:'short',day:'numeric'})} 💕`, 'success')
      // Auto-open invitation modal
      setInviteModal(saved)
    } catch(e) {
      showToast(`Save failed: ${e.message}`, 'error')
    }
    setSavingBook(false)
  }

  const deleteBooking = async id => {
    await supabase.from('bookings').delete().eq('id', id)
    setBookingModal(null)
    showToast('Booking removed', 'info')
  }

  const saveInvitation = async (id, message) => {
    await supabase.from('bookings').update({ invitation_message: message }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, invitation_message: message } : b))
  }

  // ── Derived ───────────────────────────────────────────
  const year       = navDate.getFullYear()
  const month      = navDate.getMonth()
  const offCount   = roster.filter(r => r.shift === 'off').length
  const bookedCount= bookings.length

  // Loading
  if (session === undefined) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background:'#0d0620' }}>
        <div className="w-10 h-10 rounded-full anim-spin" style={{ border:'3px solid #4c1d95', borderTopColor:'#a78bfa' }} />
      </div>
    )
  }

  if (!session) return <LoginPage />

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(155deg,#0d0620 0%,#1a0838 55%,#080114 100%)' }}>

      {/* Modals */}
      {bookingModal && (
        <BookingModal
          date={bookingModal.date}
          existing={bookingModal.existing}
          onSave={saveBooking}
          onDelete={deleteBooking}
          onClose={() => setBookingModal(null)}
          saving={savingBook}
        />
      )}
      {inviteModal && (
        <InvitationModal
          booking={inviteModal}
          userEmail={session.user.email}
          onClose={() => setInviteModal(null)}
          onSaved={saveInvitation}
          showToast={showToast}
        />
      )}

      <Toast toast={toast} dismiss={() => setToast(null)} />

      <Header user={session.user} rosterCount={roster.length} offCount={offCount} bookedCount={bookedCount} />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-5 pb-20">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <UploadPanel onUpload={handleUpload} loading={loadingRst} preview={preview} count={roster.length} />
            <ShiftStats roster={roster} />
            <UpcomingBookings
              bookings={bookings}
              onEdit={b => setBookingModal({ date: b.date, existing: b })}
              onInvite={b => setInviteModal(b)}
            />
          </aside>

          {/* Calendar */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl p-4 sm:p-5"
                 style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(124,58,237,.2)' }}>

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-800/50 transition-all text-lg">‹</button>
                  <h2 className="font-serif-display text-white font-semibold text-lg sm:text-xl min-w-36 text-center">{MONTHS_LONG[month]} {year}</h2>
                  <button onClick={() => navigate(1)}  className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-800/50 transition-all text-lg">›</button>
                  <button onClick={goToday} className="text-xs text-purple-500 hover:text-purple-300 px-2.5 py-1 rounded-lg hover:bg-purple-900/40 border border-purple-900 hover:border-purple-700 transition-all">Today</button>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background:'rgba(124,58,237,.2)' }}>
                  {['monthly','weekly'].map(v => (
                    <button key={v} onClick={() => setView(v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${view===v ? 'text-white shadow-lg' : 'text-purple-500 hover:text-purple-300'}`}
                            style={view===v ? { background:'linear-gradient(135deg,#7c3aed,#a855f7)' } : {}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {roster.length === 0 && (
                <div className="text-center py-20 anim-fade">
                  <div className="text-5xl mb-4">📸</div>
                  <p className="text-purple-300 font-medium mb-2">No roster loaded yet</p>
                  <p className="text-purple-600 text-sm">Upload a photo of your work schedule<br/>and it'll appear here automatically.</p>
                </div>
              )}

              {roster.length > 0 && view === 'monthly' && (
                <MonthlyCalendar year={year} month={month} roster={roster} bookings={bookings} onDay={openDay} />
              )}
              {roster.length > 0 && view === 'weekly' && (
                <WeeklyCalendar year={year} month={month} roster={roster} bookings={bookings} onDay={openDay} weekOffset={weekOffset} onWeek={delta => setWeekOffset(o => o+delta)} />
              )}
            </div>

            {roster.length > 0 && (
              <p className="text-purple-700 text-xs text-center mt-3 anim-fade">
                ✨ Tap any <span className="text-emerald-600 font-medium">Day Off</span> to book a date together
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
