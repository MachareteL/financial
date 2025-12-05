create table if not exists rate_limits (
  team_id uuid primary key references teams(id) on delete cascade,
  count integer not null default 0,
  window_start timestamp with time zone not null default now()
);
