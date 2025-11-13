-- SCRIPT DE MIGRAÇÃO SEGURO: 1-N (Family) PARA N-M (Teams) SEM PERDA DE DADOS

BEGIN; -- Inicia a transação. Se algo falhar, tudo é revertido.

-- ---
-- PASSO 1: RENOMEAR TABELAS (Seguro: Preserva dados)
-- ---
-- ALTER TABLE public.families RENAME TO teams;
-- ALTER TABLE public.family_roles RENAME TO team_roles;
-- ALTER TABLE public.family_invites RENAME TO team_invites;

-- ---
-- PASSO 2: RENOMEAR COLUNAS (Seguro: Preserva dados e FKs)
-- ---

-- 'team_roles'
-- ALTER TABLE public.team_roles RENAME COLUMN family_id TO team_id;
ALTER INDEX IF EXISTS idx_family_roles_family_id RENAME TO idx_team_roles_team_id;
ALTER TABLE public.team_roles
  RENAME CONSTRAINT family_roles_family_id_fkey TO team_roles_team_id_fkey;
ALTER TABLE public.team_roles
  ADD CONSTRAINT team_roles_id_team_id_key UNIQUE (id, team_id);

-- 'team_invites'
-- ALTER TABLE public.team_invites RENAME COLUMN family_id TO team_id;
-- ALTER TABLE public.team_invites
--   RENAME CONSTRAINT family_invites_family_id_fkey TO team_invites_team_id_fkey;
ALTER TABLE public.team_invites
  RENAME CONSTRAINT family_invites_role_id_fkey TO team_invites_role_id_fkey;
ALTER INDEX IF EXISTS family_invites_family_id_idx RENAME TO team_invites_team_id_idx;
ALTER INDEX IF EXISTS idx_family_invites_role_id RENAME TO idx_team_invites_role_id;

-- 'categories'
-- ALTER TABLE public.categories RENAME COLUMN family_id TO team_id;
ALTER INDEX IF EXISTS categories_family_id_idx RENAME TO categories_team_id_idx;
ALTER TABLE public.categories
  RENAME CONSTRAINT categories_family_id_fkey TO categories_team_id_fkey;

-- 'expenses'
-- ALTER TABLE public.expenses RENAME COLUMN family_id TO team_id;
ALTER INDEX IF EXISTS expenses_family_id_idx RENAME TO expenses_team_id_idx;
ALTER TABLE public.expenses
  RENAME CONSTRAINT expenses_family_id_fkey TO expenses_team_id_fkey;

-- 'budgets'
ALTER TABLE public.budgets RENAME COLUMN family_id TO team_id;
ALTER INDEX IF EXISTS budgets_family_id_idx RENAME TO budgets_team_id_idx;
-- ALTER TABLE public.budgets
--   RENAME CONSTRAINT budgets_family_id_fkey TO budgets_team_id_fkey;

-- 'incomes'
ALTER TABLE public.incomes RENAME COLUMN family_id TO team_id;
ALTER INDEX IF EXISTS incomes_family_id_idx RENAME TO incomes_team_id_idx;
-- ALTER TABLE public.incomes
--   RENAME CONSTRAINT incomes_family_id_fkey TO incomes_team_id_fkey;

-- 'investments'
ALTER TABLE public.investments RENAME COLUMN family_id TO team_id;
ALTER INDEX IF EXISTS investments_family_id_idx RENAME TO investments_team_id_idx;
-- ALTER TABLE public.investments
--   RENAME CONSTRAINT investments_family_id_fkey TO investments_team_id_fkey;

-- ---
-- PASSO 3: CRIAR A NOVA TABELA DE JUNÇÃO (Seguro: Tabela nova)
-- ---
CREATE TABLE IF NOT EXISTS public.team_members (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id    UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL, -- FK será adicionada após a migração de dados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (profile_id, team_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role_id ON public.team_members(role_id);


-- ---
-- PASSO 4: MIGRAÇÃO DE DADOS (O CORAÇÃO DA OPERAÇÃO)
-- ---

-- 4.1. Garante que cada equipe tenha um role "Administrador" (Seguro: usa WHERE NOT EXISTS)
INSERT INTO public.team_roles (team_id, name, color, permissions)
SELECT 
  t.id,
  'Administrador',
  '#ef4444',
  ARRAY[
    'view_dashboard', 'view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses',
    'view_budget', 'edit_budget', 'view_investments', 'edit_investments',
    'view_categories', 'edit_categories', 'manage_family', 'manage_roles'
  ]
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.team_roles tr 
  WHERE tr.team_id = t.id AND tr.name = 'Administrador'
);

-- 4.2. **Migra as permissões antigas:** Copia a relação de `profiles.family_id` para a nova `team_members`
INSERT INTO public.team_members (profile_id, team_id, role_id)
SELECT
  p.id,                               -- o ID do usuário
  p.family_id,                        -- o ID da equipe (antiga família)
  (SELECT tr.id FROM public.team_roles tr -- Busca o ID do role "Admin" DESSA EQUIPE
   WHERE tr.team_id = p.family_id AND tr.name = 'Administrador' LIMIT 1)
FROM
  public.profiles p
WHERE
  p.family_id IS NOT NULL -- Apenas para usuários que já estavam em uma família
ON CONFLICT (profile_id, team_id) DO NOTHING; -- Seguro: Não faz nada se a relação já existir

-- 4.3. Adiciona a FK em 'team_members' (Seguro: só valida os dados que acabamos de inserir)
ALTER TABLE public.team_members
  ADD CONSTRAINT fk_team_members_role_id
  FOREIGN KEY (role_id, team_id) 
  REFERENCES public.team_roles (id, team_id);
  
-- ---
-- PASSO 5: REMOVER AS COLUNAS ANTIGAS E SUAS POLÍTICAS DEPENDENTES (A CORREÇÃO)
-- ---
-- Usar 'CASCADE' aqui é SEGURO. Ele não vai apagar suas tabelas (como expenses).
-- Ele vai apagar APENAS os objetos que dependem da coluna 'family_id',
-- que são as POLÍTICAS RLS ANTIGAS (como listado no seu erro).
-- Nós vamos recriar todas essas políticas no PASSO 6.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS family_id CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role_id CASCADE;

-- ---
-- PASSO 6: RECONSTRUIR TODAS AS POLÍTICAS DE RLS (usando 'team_members')
-- (Isso restaura o acesso, agora usando a nova tabela de permissão)
-- ---

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships" ON public.team_members
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can delete their own membership" ON public.team_members
  FOR DELETE USING (profile_id = auth.uid());
  
CREATE POLICY "Users can view teams they are members of" ON public.teams
  FOR SELECT USING (id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));
CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage roles of teams they are members of" ON public.team_roles
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));
  
CREATE POLICY "Users can manage expenses of their teams" ON public.expenses
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));

CREATE POLICY "Users can manage categories of their teams" ON public.categories
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));

CREATE POLICY "Users can manage budgets of their teams" ON public.budgets
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));

CREATE POLICY "Users can manage incomes of their teams" ON public.incomes
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));

CREATE POLICY "Users can manage investments of their teams" ON public.investments
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));
  
CREATE POLICY "Users can manage invites for their teams or their email" ON public.team_invites
  FOR ALL USING (email = auth.email() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (email = auth.email() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));
  
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

COMMIT; -- Finaliza a transação e aplica as mudanças