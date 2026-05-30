export const ALLOWED_EMAILS = ['shaunshankar1@gmail.com', 'arpanadevi125@gmail.com']

export const PARTNER_EMAIL = (myEmail) =>
  myEmail === 'shaunshankar1@gmail.com'
    ? 'arpanadevi125@gmail.com'
    : 'shaunshankar1@gmail.com'

export const SHIFT = {
  morning:   { bg:'#f59e0b', softBg:'#fffbeb', textDark:'#78350f', border:'#fcd34d', label:'Morning',   emoji:'🌅', tag:'bg-amber-400 text-amber-900' },
  afternoon: { bg:'#f97316', softBg:'#fff7ed', textDark:'#7c2d12', border:'#fb923c', label:'Afternoon', emoji:'☀️', tag:'bg-orange-500 text-white' },
  night:     { bg:'#4338ca', softBg:'#eef2ff', textDark:'#1e1b4b', border:'#6366f1', label:'Night',     emoji:'🌙', tag:'bg-indigo-700 text-indigo-100' },
  off:       { bg:'#10b981', softBg:'#ecfdf5', textDark:'#064e3b', border:'#34d399', label:'Day Off',   emoji:'✨', tag:'bg-emerald-500 text-white' },
}

export const DAYS_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function toKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function displayDate(str) {
  const [y,m,d] = str.split('-')
  return new Date(+y,+m-1,+d).toLocaleDateString('en-AU',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
}

export function daysInMonth(y,m)     { return new Date(y,m+1,0).getDate() }
export function firstDayOfMonth(y,m) { return new Date(y,m,1).getDay() }
export function todayKey()           { return toKey(new Date()) }

export function formatTime(t) {
  if (!t) return ''
  const [h,min] = t.split(':')
  const hh = +h; const ampm = hh >= 12 ? 'pm' : 'am'
  const h12 = hh % 12 || 12
  return `${h12}:${min}${ampm}`
}
