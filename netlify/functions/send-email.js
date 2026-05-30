export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { to, booking, invitationText } = await req.json()

  const ALLOWED = ['shaunshankar1@gmail.com', 'arpanadevi125@gmail.com']
  if (!ALLOWED.includes(to)) {
    return new Response(JSON.stringify({ error: 'Unauthorised recipient' }), { status: 403 })
  }

  const formatTime = t => {
    if (!t) return ''
    const [h, min] = t.split(':')
    const hh = +h; const ampm = hh >= 12 ? 'pm' : 'am'
    const h12 = hh % 12 || 12
    return `${h12}:${min}${ampm}`
  }

  const dateStr = new Date(booking.date + 'T12:00').toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#0d0620; font-family:'Georgia',serif; }
    .wrap { max-width:520px; margin:40px auto; background:linear-gradient(160deg,#2d1065,#1a0840); border-radius:24px; overflow:hidden; border:1px solid rgba(124,58,237,.4); }
    .hero { padding:40px 40px 24px; text-align:center; }
    .emoji { font-size:48px; display:block; margin-bottom:16px; }
    h1 { color:#fff; font-size:28px; margin:0 0 4px; font-family:'Georgia',serif; }
    .sub { color:#a78bfa; font-style:italic; font-size:14px; margin:0 0 32px; }
    .card { margin:0 32px; background:rgba(124,58,237,.18); border:1px solid rgba(167,139,250,.3); border-radius:16px; padding:28px; }
    .love { color:#7c3aed; font-size:10px; text-transform:uppercase; letter-spacing:4px; text-align:center; margin-bottom:20px; }
    .message { color:#e9d5ff; font-style:italic; line-height:1.8; font-size:15px; margin:0 0 24px; }
    .details { border-top:1px solid rgba(124,58,237,.25); padding-top:20px; text-align:center; }
    .detail { color:#a78bfa; font-size:13px; margin:6px 0; font-family:'Arial',sans-serif; }
    .footer { padding:28px 40px; text-align:center; }
    .footer p { color:#6d28d9; font-size:12px; margin:0; font-family:'Arial',sans-serif; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <span class="emoji">💜</span>
    <h1>Snuggle State</h1>
    <p class="sub">— Together</p>
  </div>
  <div class="card">
    <p class="love">— With Love —</p>
    <p class="message">"${invitationText}"</p>
    <div class="details">
      <p class="detail">📅 ${dateStr}</p>
      ${booking.time     ? `<p class="detail">⏰ ${formatTime(booking.time)}</p>` : ''}
      ${booking.location ? `<p class="detail">📍 ${booking.location}</p>`         : ''}
      ${booking.notes    ? `<p class="detail">💬 ${booking.notes}</p>`            : ''}
    </div>
  </div>
  <div class="footer">
    <p>Sent with love via Snuggle State ✨</p>
  </div>
</div>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Snuggle State <hello@snugglestate.app>',
      to: [to],
      subject: `💜 A special invitation for you: ${booking.event_name}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return new Response(JSON.stringify({ error: err.message || 'Resend error' }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
