create table if not exists public.feedbacks (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  type text not null,
  title text not null,
  description text not null,
  created_by text null, -- Stores email or "Anonymous"
  user_id uuid null references auth.users (id), -- Link to user if authenticated
  status text not null default 'pending',
  constraint feedbacks_pkey primary key (id)
);

-- RLS Policies
alter table public.feedbacks enable row level security;

create policy "Users can insert their own feedback"
on public.feedbacks
for insert
to authenticated
with check (true);

create policy "Anon can insert feedback"
on public.feedbacks
for insert
to anon
with check (true);
