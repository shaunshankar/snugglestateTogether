import nodemailer from 'nodemailer'

const RECIPIENT = 'arpanadevi125@gmail.com'

function formatTime(t) {
  if (!t) return ''
  const [h, min] = t.split(':')
  const hh = +h
  const ampm = hh >= 12 ? 'pm' : 'am'
  const h12 = hh % 12 || 12
  return `${h12}:${min}${ampm}`
}

function displayDate(str) {
  const [y, m, d] = str.split('-')
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { booking, invitationText } = req.body
  if (!booking || !invitationText) {
    return res.status(400).json({ error: 'Missing booking or invitationText' })
  }

  const dateStr = displayDate(booking.date)

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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: `Snuggle State <${process.env.GMAIL_USER}>`,
      to: RECIPIENT,
      subject: `💜 A special invitation for you: ${booking.event_name} · ${dateStr}`,
      html,
    })
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
