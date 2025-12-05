create table if not exists public.quiz_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  current_question_index integer default 0,
  
  -- Player 1 (Host)
  player_1_id uuid, -- Optional, if we want to link to auth users later
  answers_p1 jsonb default '[]'::jsonb,
  result_p1 text,
  
  -- Player 2 (Guest)
  player_2_id uuid,
  answers_p2 jsonb default '[]'::jsonb,
  result_p2 text
);

-- Enable RLS
alter table public.quiz_sessions enable row level security;

-- Allow anyone to create a session (for PLG, we might not force login yet)
create policy "Enable insert for anyone" on public.quiz_sessions
  for insert with check (true);

-- Allow anyone with the ID to view/update (simplified for this PLG demo)
-- In a real app, we'd use a secure token or auth
create policy "Enable select for anyone" on public.quiz_sessions
  for select using (true);

create policy "Enable update for anyone" on public.quiz_sessions
  for update using (true);

-- Realtime
alter publication supabase_realtime add table public.quiz_sessions;
