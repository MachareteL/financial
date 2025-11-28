BEGIN;

-- ==============================================================================
-- 1. LIMPEZA TOTAL (Para garantir que não haja conflitos)
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their own membership" ON public.team_members;
DROP POLICY IF EXISTS "Manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Join team via invite" ON public.team_members;
DROP POLICY IF EXISTS "View team members" ON public.team_members;
DROP POLICY IF EXISTS "Insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Update team members" ON public.team_members;

-- ==============================================================================
-- 2. FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- Estas funções são a chave: elas leem o banco sem disparar novas verificações de RLS.
-- ==============================================================================

-- a) Retorna os IDs dos times que o usuário faz parte
CREATE OR REPLACE FUNCTION get_my_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER -- Roda como admin
SET search_path = public
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE profile_id = auth.uid();
$$;

-- b) Verifica se o usuário é DONO de um time específico
CREATE OR REPLACE FUNCTION is_team_owner(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = check_team_id 
    AND created_by = auth.uid()
  );
$$;

-- c) Verifica se existe um CONVITE pendente para o usuário neste time
CREATE OR REPLACE FUNCTION has_pending_invite(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_invites 
    WHERE team_id = check_team_id 
    AND email = auth.email() 
    AND status = 'pending'
  );
$$;

-- ==============================================================================
-- 3. NOVAS POLÍTICAS BLINDADAS PARA TEAM_MEMBERS
-- ==============================================================================

-- LEITURA (SELECT)
-- Vejo membros se: sou eu mesmo, OU é um time meu (sou membro), OU sou dono.
CREATE POLICY "RLS_Select_TeamMembers"
ON public.team_members
FOR SELECT
TO public
USING (
  profile_id = auth.uid() 
  OR team_id IN (SELECT get_my_teams()) 
  OR is_team_owner(team_id)
);

-- INSERÇÃO (INSERT) - Corrige o erro ao aceitar convite
-- Entro se: sou dono (add manual) OU tenho convite (aceite)
CREATE POLICY "RLS_Insert_TeamMembers"
ON public.team_members
FOR INSERT
TO public
WITH CHECK (
  is_team_owner(team_id)
  OR (profile_id = auth.uid() AND has_pending_invite(team_id))
);

-- REMOÇÃO (DELETE)
-- Deleto se: sou eu mesmo (sair) OU sou dono (expulsar)
CREATE POLICY "RLS_Delete_TeamMembers"
ON public.team_members
FOR DELETE
TO public
USING (
  profile_id = auth.uid() 
  OR is_team_owner(team_id)
);

-- ATUALIZAÇÃO (UPDATE)
-- Apenas o dono pode alterar membros (ex: mudar cargo)
CREATE POLICY "RLS_Update_TeamMembers"
ON public.team_members
FOR UPDATE
TO public
USING (
  is_team_owner(team_id)
);

-- ==============================================================================
-- 4. POLÍTICAS AUXILIARES (Para corrigir visualização do convite)
-- ==============================================================================

-- Permitir ver Profiles de quem te convidou
DROP POLICY IF EXISTS "View inviter profile" ON public.profiles;
CREATE POLICY "RLS_View_Inviter_Profile"
ON public.profiles
FOR SELECT
TO public
USING (
  id IN (
    SELECT invited_by FROM public.team_invites
    WHERE email = auth.email() AND status = 'pending'
  )
  OR id = auth.uid()
  OR id IN (
      SELECT tm.profile_id 
      FROM public.team_members tm
      WHERE tm.team_id IN (SELECT get_my_teams())
  )
);

-- Permitir ver Cargos do time que te convidou
DROP POLICY IF EXISTS "View roles from pending invites" ON public.team_roles;
CREATE POLICY "RLS_View_Invite_Roles"
ON public.team_roles
FOR SELECT
TO public
USING (
  team_id IN (SELECT get_my_teams()) -- Cargos dos meus times
  OR has_pending_invite(team_id)     -- Cargos do time que me convidou
);

COMMIT;