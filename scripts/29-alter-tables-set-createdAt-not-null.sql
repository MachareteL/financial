
ALTER TABLE public.profiles ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.teams ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.team_roles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.expenses ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.budgets ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.incomes ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.investments ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.team_invites ALTER COLUMN created_at SET NOT NULL;