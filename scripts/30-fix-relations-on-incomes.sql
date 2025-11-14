BEGIN;

-- 1. Adiciona a Foreign Key para 'team_id'
-- Garante que uma receita pertence a um time e é deletada se o time for.
ALTER TABLE public.incomes
ADD CONSTRAINT incomes_team_id_fkey
FOREIGN KEY (team_id) 
REFERENCES public.teams(id) 
ON DELETE CASCADE;

-- 2. Adiciona a Foreign Key para 'user_id'
-- Garante que uma receita pertence a um perfil.
-- Usamos ON DELETE SET NULL para que, se o usuário for deletado,
-- a receita permaneça no time, mas sem um "dono".
ALTER TABLE public.incomes
ADD CONSTRAINT incomes_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

COMMIT;