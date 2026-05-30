# Snuggle State — Together

A private couples app for coordinating your schedules and planning dates together. Upload a work roster photo and the app uses AI (Claude) to parse your shifts — then book dates on your days off and send heartfelt AI-generated invitations to each other.

---

## What is Snuggle State?

Snuggle State is a full-stack web app built for exactly two people. It lets you:

- **Upload a roster image** — Claude's vision API reads your work schedule and maps each day to a shift type (morning, afternoon, night, or day off)
- **View your calendar** — monthly and weekly views showing all shifts colour-coded
- **Book dates** — tap any day off to plan an activity together
- **Send invitations** — Claude generates a personal, heartfelt invitation message which gets emailed to your partner via Resend

Access is locked to two specific email addresses only.

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An [Anthropic](https://console.anthropic.com) API key
- A [Resend](https://resend.com) account and API key
- (For deployment) A [Netlify](https://netlify.com) account

---

## Setup: Filling in .env

Copy `.env.example` to `.env` and fill in all four values:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
```

- **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** — found in your Supabase project under Settings > API
- **VITE_ANTHROPIC_API_KEY** — from the Anthropic Console
- **RESEND_API_KEY** — from the Resend dashboard (note: this is server-side only, used by the Netlify function)

---

## Setup: Running the Supabase SQL Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste the entire contents of `supabase/migration.sql`
4. Click **Run**

This creates the `profiles`, `rosters`, and `bookings` tables with row-level security policies, and sets up the trigger that auto-creates a profile when a user signs up.

---

## Setup: Creating the Two User Accounts in Supabase

You need to create accounts for both email addresses before anyone can log in.

**Option A — Supabase Dashboard (recommended):**
1. Go to **Authentication > Users** in your Supabase project
2. Click **Invite user** and enter `shaunshankar1@gmail.com` — the user receives an email to set their password
3. Repeat for `arpanadevi125@gmail.com`

**Option B — SQL Editor (sets password directly):**
Run this in the SQL editor (requires service role, not anon key — only run in the Supabase SQL editor, not from client code):

```sql
select auth.create_user('{"email":"shaunshankar1@gmail.com","password":"ChangeMe123!","email_confirm":true}');
select auth.create_user('{"email":"arpanadevi125@gmail.com","password":"ChangeMe123!","email_confirm":true}');
```

Change the passwords immediately after first login.

---

## Running Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Note: The Netlify function (`send-email`) won't work locally unless you run `netlify dev` instead of `npm run dev`. To use `netlify dev`, install the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This serves the frontend and the Netlify functions together at `http://localhost:8888`.

---

## Deploying to Netlify

1. **Push your code to a GitHub repository** (make sure `.env` is in `.gitignore` — it already is)

2. **Connect the repo to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click **Add new site > Import an existing project**
   - Select your GitHub repository
   - Build settings are auto-detected from `netlify.toml`: build command `npm run build`, publish directory `dist`

3. **Set environment variables in Netlify:**
   - Go to **Site configuration > Environment variables**
   - Add all four variables from your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ANTHROPIC_API_KEY`
     - `RESEND_API_KEY`

4. **Deploy** — Netlify will build and deploy automatically on every push to your main branch.

---

## Notes: Resend From-Email Domain

The Netlify function sends email `from: 'Snuggle State <hello@snugglestate.app>'`.

For this to work in production, you must either:

- **Verify the domain** `snugglestate.app` in your Resend dashboard (Domains > Add Domain), or
- **Change the from address** in `netlify/functions/send-email.js` to use Resend's shared sending domain: `onboarding@resend.dev` (only works for sending to your own verified email address during testing)

For a real deployment, verify your own domain in Resend and update the `from` field accordingly. Resend provides DNS records (SPF, DKIM) to add to your domain registrar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + Tailwind CSS |
| Auth + Database | Supabase (PostgreSQL + Row Level Security) |
| AI Vision + Text | Anthropic Claude (`claude-sonnet-4-6`) |
| Email | Resend (via Netlify Function) |
| Hosting | Netlify |
