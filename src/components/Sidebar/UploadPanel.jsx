import { useRef, useState, useCallback } from 'react'

function Spinner({ text }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-9 h-9 rounded-full anim-spin"
           style={{ border:'3px solid #4c1d95', borderTopColor:'#a78bfa' }} />
      {text && <p className="text-purple-400 text-sm anim-pulse">{text}</p>}
    </div>
  )
}

export default function UploadPanel({ onUpload, loading, preview, count }) {
  const fileRef = useRef()
  const [drag, setDrag] = useState(false)

  const handle = file => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const base64 = e.target.result.split(',')[1]
      onUpload(base64, file.type, e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDrag(false)
    handle(e.dataTransfer.files[0])
  }, [])

  return (
    <div className="rounded-2xl p-5"
         style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.25)' }}>
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-base">📋 Roster Image</h3>

      <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer
           ${drag ? 'border-purple-400 bg-purple-900/30' : 'border-purple-800 hover:border-purple-600'}`}
           onClick={() => fileRef.current?.click()}
           onDragOver={e => { e.preventDefault(); setDrag(true) }}
           onDragLeave={() => setDrag(false)}
           onDrop={onDrop}>
        {loading ? (
          <Spinner text="Parsing roster with AI…" />
        ) : preview ? (
          <>
            <img src={preview} alt="roster" className="max-h-28 mx-auto rounded-lg mb-3 object-contain" />
            <p className="text-emerald-400 text-sm font-semibold">✓ {count} shifts loaded</p>
            <p className="text-purple-500 text-xs mt-1">Drop or click to replace</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">📸</div>
            <p className="text-purple-200 font-medium text-sm">Drop your roster photo here</p>
            <p className="text-purple-600 text-xs mt-1">JPG · PNG · HEIC · WEBP</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
             onChange={e => handle(e.target.files[0])} />
    </div>
  )
}
