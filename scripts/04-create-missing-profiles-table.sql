-- Cria a tabela profiles (e índices) se ainda não existir
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text      not null,
  name       text      not null,
  family_id  uuid      references public.families (id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Garante que family_id seja buscável rapidamente
create index if not exists profiles_family_id_idx on public.profiles (family_id);

alter table public.profiles enable row level security;

-- Politicas (caso ainda não tenham sido criadas)
do
$$
begin
  -- SELECT
  if not exists (
    select 1
    from pg_policies
    where polname = 'Users can view profiles in their family'
      and tablename = 'profiles'
  ) then
    create policy "Users can view profiles in their family"
      on public.profiles
      for select using (
        id = auth.uid()
        or family_id in (select family_id from public.profiles where id = auth.uid())
      );
  end if;

  -- INSERT
  if not exists (
    select 1
    from pg_policies
    where polname = 'Users can insert their own profile'
      and tablename = 'profiles'
  ) then
    create policy "Users can insert their own profile"
      on public.profiles
      for insert with check (id = auth.uid());
  end if;

  -- UPDATE
  if not exists (
    select 1
    from pg_policies
    where polname = 'Users can update their own profile'
      and tablename = 'profiles'
  ) then
    create policy "Users can update their own profile"
      on public.profiles
      for update using (id = auth.uid());
  end if;
end
$$;
