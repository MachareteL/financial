-- ------------------------------------------------------------------
-- Cria a tabela public.profiles + RLS só se não existir
-- ------------------------------------------------------------------
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text      not null,
  name       text      not null,
  family_id  uuid      references public.families (id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Índice para buscas por family_id
create index if not exists profiles_family_id_idx on public.profiles (family_id);

-- ------------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Visualizar perfis da mesma família + o próprio
create policy if not exists "Profiles: select"
  on public.profiles
  for select
  using (
    id = auth.uid()
    or family_id in (select family_id from public.profiles where id = auth.uid())
  );

-- Inserir o próprio perfil
create policy if not exists "Profiles: insert self"
  on public.profiles
  for insert
  with check (id = auth.uid());

-- Atualizar o próprio perfil
create policy if not exists "Profiles: update self"
  on public.profiles
  for update
  using (id = auth.uid());
