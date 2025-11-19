-- scripts/39-enable-client-side-creation.sql

BEGIN;

-- 1. Adicionar coluna de dono/criador na tabela teams
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Atualiza times existentes (assumindo que o primeiro membro é o criador, paliativo)
UPDATE public.teams t
SET created_by = (
  SELECT profile_id 
  FROM public.team_members tm 
  WHERE tm.team_id = t.id 
  ORDER BY tm.created_at ASC 
  LIMIT 1
)
WHERE created_by IS NULL;

-- 2. Atualizar Políticas de TIMES (A chave da solução)
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Creators can manage their teams" ON public.teams;

-- Permitir INSERT gravando o created_by
CREATE POLICY "Authenticated users can create teams"
ON public.teams
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir SELECT se for membro OU se for o CRIADOR (Isso resolve o erro do RETURNING)
CREATE POLICY "Users can view teams"
ON public.teams
FOR SELECT
TO public
USING (
  id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid())
  OR 
  created_by = auth.uid() -- <--- A Mágica acontece aqui
);

-- Permitir UPDATE/DELETE para o criador
CREATE POLICY "Creators can update teams"
ON public.teams
FOR UPDATE
TO public
USING (created_by = auth.uid());

CREATE POLICY "Creators can delete teams"
ON public.teams
FOR DELETE
TO public
USING (created_by = auth.uid());

-- 3. Atualizar Políticas de CARGOS (Permitir criador inserir cargos)
DROP POLICY IF EXISTS "Users can manage roles of teams they are members of" ON public.team_roles;

CREATE POLICY "Users can manage roles"
ON public.team_roles
FOR ALL
TO public
USING (
  team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_roles.team_id AND created_by = auth.uid()) -- <--- Criador pode gerenciar cargos
)
WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

-- 4. Atualizar Políticas de MEMBROS (Permitir criador se adicionar)
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can view all members of their teams" ON public.team_members;

-- Política unificada e permissiva para o criador
CREATE POLICY "Manage team members"
ON public.team_members
FOR ALL
TO public
USING (
  profile_id = auth.uid() -- Posso ver/sair do meu próprio
  OR
  team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid()) -- Posso ver colegas
  OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid()) -- Criador vê tudo
)
WITH CHECK (
  -- Regras para INSERT/UPDATE
  profile_id = auth.uid() -- Posso me adicionar (se tiver convite ou for criador)
  OR
  team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid()) -- Membros (com permissão via app)
  OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid()) -- Criador pode adicionar gente
);

COMMIT;