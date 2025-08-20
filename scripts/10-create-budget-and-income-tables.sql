-- ------------------------------------------------------------------
-- Cria tabelas para orçamento, receitas e investimentos
-- ------------------------------------------------------------------

-- Tabela de receitas (salários e entradas pontuais)
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'one_time')),
  frequency TEXT CHECK (frequency IN ('monthly', 'weekly', 'yearly') OR frequency IS NULL),
  date DATE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de orçamento mensal
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  necessidades_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  desejos_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  poupanca_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_income DECIMAL(10,2) NOT NULL DEFAULT 0,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, month, year)
);

-- Tabela de investimentos
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('savings', 'stocks', 'bonds', 'real_estate', 'crypto', 'other')),
  initial_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) NOT NULL,
  monthly_contribution DECIMAL(10,2) DEFAULT 0,
  annual_return_rate DECIMAL(5,2) NOT NULL, -- Percentual anual
  start_date DATE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS incomes_family_id_idx ON public.incomes (family_id);
CREATE INDEX IF NOT EXISTS incomes_date_idx ON public.incomes (date);
CREATE INDEX IF NOT EXISTS incomes_type_idx ON public.incomes (type);

CREATE INDEX IF NOT EXISTS budgets_family_id_idx ON public.budgets (family_id);
CREATE INDEX IF NOT EXISTS budgets_month_year_idx ON public.budgets (month, year);

CREATE INDEX IF NOT EXISTS investments_family_id_idx ON public.investments (family_id);

-- Row Level Security
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para incomes
CREATE POLICY "Incomes: select"
  ON public.incomes
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Incomes: insert"
  ON public.incomes
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Incomes: update"
  ON public.incomes
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Incomes: delete"
  ON public.incomes
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas RLS para budgets
CREATE POLICY "Budgets: select"
  ON public.budgets
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Budgets: insert"
  ON public.budgets
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Budgets: update"
  ON public.budgets
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Budgets: delete"
  ON public.budgets
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas RLS para investments
CREATE POLICY "Investments: select"
  ON public.investments
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Investments: insert"
  ON public.investments
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Investments: update"
  ON public.investments
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Investments: delete"
  ON public.investments
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
