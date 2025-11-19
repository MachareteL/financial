BEGIN;

-- ============================================================
-- 1. CORREÇÃO DE CHAVES ESTRANGEIRAS (INTEGRIDADE)
-- ============================================================

-- Adiciona a FK faltante em 'investments' (team_id -> teams.id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'investments_team_id_fkey'
  ) THEN
    ALTER TABLE public.investments
    ADD CONSTRAINT investments_team_id_fkey
    FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Adiciona a FK faltante em 'budgets' (team_id -> teams.id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budgets_team_id_fkey'
  ) THEN
    ALTER TABLE public.budgets
    ADD CONSTRAINT budgets_team_id_fkey
    FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Adiciona a FK faltante em 'incomes' (team_id -> teams.id)
-- (Garante integridade caso não exista, embora relatório não mostre erro aqui)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incomes_team_id_fkey'
  ) THEN
    ALTER TABLE public.incomes
    ADD CONSTRAINT incomes_team_id_fkey
    FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) 
    ON DELETE CASCADE;
  END IF;
END $$;


-- ============================================================
-- 2. OTIMIZAÇÃO DE PERFORMANCE (ÍNDICES)
-- ============================================================

-- EXPENSES
CREATE INDEX IF NOT EXISTS idx_expenses_team_id ON public.expenses(team_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
-- Índice composto para acelerar o dashboard
CREATE INDEX IF NOT EXISTS idx_expenses_team_date ON public.expenses(team_id, date DESC);

-- INCOMES
CREATE INDEX IF NOT EXISTS idx_incomes_team_id ON public.incomes(team_id);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_team_date ON public.incomes(team_id, date);

-- INVESTMENTS
-- Apenas team_id (user_id não existe nesta tabela)
CREATE INDEX IF NOT EXISTS idx_investments_team_id ON public.investments(team_id);

-- CATEGORIES
CREATE INDEX IF NOT EXISTS idx_categories_team_id ON public.categories(team_id);
CREATE INDEX IF NOT EXISTS idx_categories_budget_category_id ON public.categories(budget_category_id);

-- BUDGET CATEGORIES
CREATE INDEX IF NOT EXISTS idx_budget_categories_team_id ON public.budget_categories(team_id);

-- BUDGETS
CREATE INDEX IF NOT EXISTS idx_budgets_team_id ON public.budgets(team_id);
CREATE INDEX IF NOT EXISTS idx_budgets_team_period ON public.budgets(team_id, year, month);

-- TEAM & AUTH (Para RLS rápido)
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role_id ON public.team_members(role_id);
CREATE INDEX IF NOT EXISTS idx_team_roles_team_id ON public.team_roles(team_id);

-- INVITES
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);


-- ============================================================
-- 3. REGRAS DE UNICIDADE E LIMPEZA DE LEGADO
-- ============================================================

-- Renomeia constraint antiga de budget para refletir team_id
-- (Se existir com nome antigo 'budgets_family_id_month_year_key')
ALTER INDEX IF EXISTS budgets_family_id_month_year_key RENAME TO unique_budget_per_month_team;

-- Se o índice não existir (porque foi dropado ou nunca criado), cria a constraint do zero
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_budget_per_month_team'
  ) AND NOT EXISTS (
     SELECT 1 FROM pg_class WHERE relname = 'unique_budget_per_month_team'
  ) THEN
    ALTER TABLE public.budgets 
    ADD CONSTRAINT unique_budget_per_month_team UNIQUE (team_id, month, year);
  END IF;
END $$;

-- Pastas de orçamento únicas por nome/time
ALTER TABLE public.budget_categories 
  DROP CONSTRAINT IF EXISTS unique_budget_category_name_team;
ALTER TABLE public.budget_categories 
  ADD CONSTRAINT unique_budget_category_name_team UNIQUE (team_id, name);

-- Categorias de gasto únicas por nome/time
ALTER TABLE public.categories 
  DROP CONSTRAINT IF EXISTS unique_category_name_team;
ALTER TABLE public.categories 
  ADD CONSTRAINT unique_category_name_team UNIQUE (team_id, name);

-- Garante que um perfil não entre 2x no mesmo time
-- (O relatório mostra 'team_members_pkey' em profile_id+team_id, o que já garante unicidade na PK)
-- Mas adicionamos constraint explicita se necessário ou removemos se redundante.
-- Como já é PK composta, não precisamos de constraint adicional UNIQUE.

-- ============================================================
-- 4. AJUSTES DE VALORES PADRÃO
-- ============================================================

ALTER TABLE public.expenses 
  ALTER COLUMN is_recurring SET DEFAULT false,
  ALTER COLUMN is_installment SET DEFAULT false;

ALTER TABLE public.incomes
  ALTER COLUMN amount SET DEFAULT 0;

COMMIT;