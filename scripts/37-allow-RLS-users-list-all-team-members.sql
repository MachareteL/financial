BEGIN;

-- 1. Remove a política que está causando o loop
DROP POLICY IF EXISTS "Users can view all members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.team_members;

-- 2. Cria uma função segura para buscar os times do usuário
-- SECURITY DEFINER: Faz a função rodar com permissões de "admin" (bypassing RLS),
-- quebrando o ciclo de verificação.
CREATE OR REPLACE FUNCTION get_auth_user_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT team_id
  FROM team_members
  WHERE profile_id = auth.uid()
$$;

-- 3. Recria a política usando a função segura
CREATE POLICY "Users can view all members of their teams"
ON public.team_members
FOR SELECT
TO public
USING (
  -- O usuário pode ver qualquer linha SE o team_id dessa linha
  -- estiver na lista de times que ele faz parte (retornada pela função segura)
  team_id IN (SELECT get_auth_user_teams())
);

COMMIT;