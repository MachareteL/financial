BEGIN;

-- Remove a política restritiva antiga
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Cria uma nova política mais abrangente
CREATE POLICY "Users can view profiles of team members"
ON public.profiles
FOR SELECT
TO public
USING (
  -- Regra 1: Posso ver meu próprio perfil
  id = auth.uid()
  OR
  -- Regra 2: Posso ver perfis de pessoas que estão nos mesmos times que eu
  id IN (
    SELECT tm_target.profile_id
    FROM public.team_members tm_target
    INNER JOIN public.team_members tm_me 
      ON tm_target.team_id = tm_me.team_id
    WHERE tm_me.profile_id = auth.uid()
  )
);

COMMIT;