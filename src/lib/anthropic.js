const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const BASE    = 'https://api.anthropic.com/v1/messages'
const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}

export async function parseRoster(base64, mediaType) {
  const year = new Date().getFullYear()
  const res = await fetch(BASE, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text:
`Analyse this work shift roster image. Extract every shift entry you can see.

Return ONLY a valid JSON array — no markdown fences, no explanation, just the raw array:
[{"date":"YYYY-MM-DD","shift":"morning","startTime":"07:00","endTime":"15:00"},...]

Classification rules:
  "morning"   — shift starts roughly 05:00–11:59
  "afternoon" — shift starts roughly 12:00–17:59
  "night"     — shift starts roughly 18:00–05:59 (next day)
  "off"       — any day off, RDO, AL, annual leave, sick leave, public holiday, rest day, blank

If no year is visible assume ${year}.
Omit startTime/endTime when times aren't shown.
Include every date visible — not just worked shifts.
Return ONLY the JSON array.` }
        ]
      }]
    })
  })
  if (!res.ok) {
    const e = await res.json().catch(()=>({}))
    throw new Error(e.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  const text = data.content[0].text.trim()
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Could not parse roster response')
  return JSON.parse(match[0])
}

export async function generateInvite(booking) {
  const { displayDate, formatTime } = await import('./helpers.js')
  const res = await fetch(BASE, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a warm, heartfelt invitation message from one partner to another for a special date together.

Details:
• Date: ${displayDate(booking.date)}
• Activity: ${booking.event_name}
• Time: ${booking.time ? formatTime(booking.time) : 'TBD'}
• Location: ${booking.location || 'TBD'}
• Notes: ${booking.notes || 'none'}

Write 3–5 sentences. Weave the details in naturally. Make it feel genuinely personal, intimate, and warm — not generic or templated. End with something tender.
Return only the message text, nothing else.`
      }]
    })
  })
  if (!res.ok) {
    const e = await res.json().catch(()=>({}))
    throw new Error(e.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.content[0].text.trim()
}
