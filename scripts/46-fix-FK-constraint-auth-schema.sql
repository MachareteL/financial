BEGIN;

-- 1. Corrigir a trava na tabela TEAMS (A mais provável causa do erro)
-- Se o usuário criou um time, ao deletar o usuário, o campo created_by ficará NULL (para não apagar o time dos outros membros)
ALTER TABLE public.teams
DROP CONSTRAINT IF EXISTS teams_created_by_fkey;

ALTER TABLE public.teams
ADD CONSTRAINT teams_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE SET NULL;


-- 2. Corrigir a trava em CONVITES (Team Invites)
-- Se quem convidou for deletado, o convite é removido (Cascade) ou o campo invited_by vira NULL
ALTER TABLE public.team_invites
DROP CONSTRAINT IF EXISTS team_invites_invited_by_fkey;

ALTER TABLE public.team_invites
ADD CONSTRAINT team_invites_invited_by_fkey
FOREIGN KEY (invited_by)
REFERENCES public.profiles(id)
ON DELETE CASCADE;


-- 3. Garantir que DESPESAS (Expenses) não travem a deleção
-- Se o usuário for deletado, mantemos a despesa no time, mas sem dono (SET NULL)
ALTER TABLE public.expenses
DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;

ALTER TABLE public.expenses
ADD CONSTRAINT expenses_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;


-- 4. Garantir que RECEITAS (Incomes) não travem a deleção
ALTER TABLE public.incomes
DROP CONSTRAINT IF EXISTS incomes_user_id_fkey;

ALTER TABLE public.incomes
ADD CONSTRAINT incomes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

COMMIT;