BEGIN;

-- ---------------------------------------------------------------------------
-- 1. CORREÇÃO DA RECURSÃO INFINITA (Função Auxiliar)
-- ---------------------------------------------------------------------------
-- Esta função precisa ser SECURITY DEFINER para ler team_members sem acionar 
-- as políticas RLS novamente (quebrando o loop infinito).
CREATE OR REPLACE FUNCTION get_auth_user_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE profile_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 2. REFAZER POLÍTICAS DE TEAM_MEMBERS (Dividir para Conquistar)
-- ---------------------------------------------------------------------------
-- Removemos as políticas antigas que causavam confusão ou bloqueio
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their own membership" ON public.team_members;
DROP POLICY IF EXISTS "Manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Join team via invite" ON public.team_members; -- Caso tenha tentado antes

-- 2.1. LEITURA (SELECT)
-- Vejo membros se: sou eu mesmo, OU estão nos meus times, OU sou dono do time.
CREATE POLICY "View team members"
ON public.team_members
FOR SELECT
TO public
USING (
  profile_id = auth.uid()
  OR
  team_id IN (SELECT get_auth_user_team_ids())
  OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid())
);

-- 2.2. ENTRAR NO TIME (INSERT) - A Correção do Erro de Aceite
-- Permite inserir se:
-- A) Sou o dono do time adicionando alguém
-- B) Sou EU MESMO aceitando um convite válido (Correção Principal)
CREATE POLICY "Insert team members"
ON public.team_members
FOR INSERT
TO public
WITH CHECK (
  -- Caso A: Dono do time
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
  OR
  -- Caso B: Aceitar convite (Eu me insiro se tiver convite pendente)
  (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.team_invites 
      WHERE team_id = team_members.team_id 
      AND email = auth.email() -- Garante que o convite é para o meu email
      AND status = 'pending'
    )
  )
);

-- 2.3. SAIR/REMOVER (DELETE)
-- Posso deletar se: sou eu mesmo (sair) OU sou dono (remover alguém)
CREATE POLICY "Delete team members"
ON public.team_members
FOR DELETE
TO public
USING (
  profile_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid())
);

-- 2.4. ATUALIZAR (UPDATE) - Apenas Donos podem mudar cargos/dados
CREATE POLICY "Update team members"
ON public.team_members
FOR UPDATE
TO public
USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid())
);

-- ---------------------------------------------------------------------------
-- 3. VISUALIZAÇÃO DE METADADOS DO CONVITE
-- ---------------------------------------------------------------------------

-- 3.1. Ver Perfil de Quem Convidou
-- Permite ver o perfil se esse perfil te enviou um convite pendente
DROP POLICY IF EXISTS "View inviter profile" ON public.profiles;
CREATE POLICY "View inviter profile"
ON public.profiles
FOR SELECT
TO public
USING (
  id IN (
    SELECT invited_by FROM public.team_invites
    WHERE email = auth.email() AND status = 'pending'
  )
);

-- 3.2. Ver Cargos do Time Convidado
-- Permite ver os cargos do time se você tem um convite pendente para ele
DROP POLICY IF EXISTS "View roles from pending invites" ON public.team_roles;
CREATE POLICY "View roles from pending invites"
ON public.team_roles
FOR SELECT
TO public
USING (
  team_id IN (
    SELECT team_id FROM public.team_invites
    WHERE email = auth.email() AND status = 'pending'
  )
);

COMMIT;