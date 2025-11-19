-- [TEAM INVITES] - Link com Time (CRÍTICO)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_invites_team_id_fkey') THEN
    ALTER TABLE public.team_invites
    ADD CONSTRAINT team_invites_team_id_fkey
    FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) 
    ON DELETE CASCADE; -- Se o time acabar, o convite some
  END IF;
END $$;

-- [TEAM INVITES] - Link com Quem Convidou (Recomendado)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_invites_invited_by_fkey') THEN
    ALTER TABLE public.team_invites
    ADD CONSTRAINT team_invites_invited_by_fkey
    FOREIGN KEY (invited_by) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE; -- Se quem convidou for deletado, remove o convite (opcional, pode ser SET NULL)
  END IF;
END $$;

-- [INVESTMENTS] - Link com Time (Reforço)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'investments_team_id_fkey') THEN
    ALTER TABLE public.investments
    ADD CONSTRAINT investments_team_id_fkey
    FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- [BUDGETS] - Link com Time (Reforço)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_team_id_fkey') THEN
    ALTER TABLE public.budgets
    ADD CONSTRAINT budgets_team_id_fkey
    FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) 
    ON DELETE CASCADE;
  END IF;
END $$;


-- ============================================================
-- 3. ÍNDICES PARA PERFORMANCE (REVISÃO FINAL)
-- ============================================================
-- Garante que todas as FKs novas tenham índices para não travar o banco em joins

CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invited_by ON public.team_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email); -- Útil para buscar convites por email

CREATE INDEX IF NOT EXISTS idx_investments_team_id ON public.investments(team_id);
CREATE INDEX IF NOT EXISTS idx_budgets_team_id ON public.budgets(team_id);

COMMIT;