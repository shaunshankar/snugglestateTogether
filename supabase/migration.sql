-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Authenticated users can read profiles" on public.profiles for select to authenticated using (true);
create policy "Authenticated users can insert profiles" on public.profiles for insert to authenticated with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Rosters ───────────────────────────────────────────────
create table if not exists public.rosters (
  id          uuid primary key default uuid_generate_v4(),
  uploaded_by uuid references public.profiles(id) on delete set null,
  month       text not null,         -- YYYY-MM
  shifts      jsonb not null default '[]',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.rosters enable row level security;
create policy "Authenticated users can read rosters"  on public.rosters for select to authenticated using (true);
create policy "Authenticated users can insert rosters" on public.rosters for insert to authenticated with check (true);
create policy "Authenticated users can update rosters" on public.rosters for update to authenticated using (true);
create policy "Authenticated users can delete rosters" on public.rosters for delete to authenticated using (true);

-- ── Bookings ──────────────────────────────────────────────
create table if not exists public.bookings (
  id                 uuid primary key default uuid_generate_v4(),
  created_by         uuid references public.profiles(id) on delete set null,
  date               text not null,  -- YYYY-MM-DD
  event_name         text not null,
  time               text,
  location           text,
  notes              text,
  invitation_message text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

alter table public.bookings enable row level security;
create policy "Authenticated users can read bookings"  on public.bookings for select to authenticated using (true);
create policy "Authenticated users can insert bookings" on public.bookings for insert to authenticated with check (true);
create policy "Authenticated users can update bookings" on public.bookings for update to authenticated using (true);
create policy "Authenticated users can delete bookings" on public.bookings for delete to authenticated using (true);

-- ── Seed users ────────────────────────────────────────────
-- You must create these users via the Supabase dashboard (Auth > Users > Invite user)
-- or via the CLI. Passwords are set on first login via the invite email.
-- Alternatively run these in the SQL editor using the service role (not anon key):
--
-- select auth.create_user('{"email":"shaunshankar1@gmail.com","password":"ChangeMe123!","email_confirm":true}');
-- select auth.create_user('{"email":"arpanadevi125@gmail.com","password":"ChangeMe123!","email_confirm":true}');
