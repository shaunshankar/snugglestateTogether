import { useEffect } from 'react'

export default function Toast({ toast, dismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(dismiss, 4500)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null
  const bg   = { success:'#059669', error:'#dc2626', info:'#7c3aed' }[toast.type] || '#7c3aed'
  const icon = { success:'✓',       error:'✕',       info:'💜'      }[toast.type] || '💜'

  return (
    <div className="fixed bottom-6 right-6 z-50 anim-slide flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm max-w-xs"
         style={{ background: bg }}>
      <span className="text-base">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button onClick={dismiss} className="opacity-70 hover:opacity-100 text-lg leading-none ml-1">×</button>
    </div>
  )
}
