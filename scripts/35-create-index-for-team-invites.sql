BEGIN;

-- 1. Índice para agrupar parcelas de uma mesma despesa rapidamente
CREATE INDEX IF NOT EXISTS idx_expenses_parent_expense_id ON public.expenses(parent_expense_id);

-- 2. Índice para FK de cargos nos convites
CREATE INDEX IF NOT EXISTS idx_team_invites_role_id ON public.team_invites(role_id);

COMMIT;