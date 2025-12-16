-- 1. Cria o Type
create type insight_type as enum ('WEEKLY_REPORT', 'BUDGET_ALERT', 'INVESTMENT_TIP');

-- 2. Cria a Tabela insights 
create table insights (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade, -- Link direto com teams
  type insight_type not null,
  title text not null,
  content text not null,
  is_read boolean default false,
  action_url text,
  created_at timestamptz default now()
);

-- 3. Cria o Index
create index insights_team_id_is_read_idx on insights(team_id, is_read);