BEGIN;

-- ============================================================
-- 1. BUDGET CATEGORIES
-- ============================================================
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage budget categories of their teams" ON public.budget_categories;

CREATE POLICY "Users can manage budget categories of their teams"
ON public.budget_categories
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 2. BUDGETS
-- ============================================================
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage budgets of their teams" ON public.budgets;

CREATE POLICY "Users can manage budgets of their teams"
ON public.budgets
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage categories of their teams" ON public.categories;

CREATE POLICY "Users can manage categories of their teams"
ON public.categories
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 4. EXPENSES
-- ============================================================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage expenses of their teams" ON public.expenses;

CREATE POLICY "Users can manage expenses of their teams"
ON public.expenses
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 5. INCOMES
-- ============================================================
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage incomes of their teams" ON public.incomes;

CREATE POLICY "Users can manage incomes of their teams"
ON public.incomes
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 6. INVESTMENTS
-- ============================================================
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage investments of their teams" ON public.investments;

CREATE POLICY "Users can manage investments of their teams"
ON public.investments
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 7. PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Insert Policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (id = auth.uid());

-- Update Policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO public
USING (id = auth.uid());

-- Select Policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO public
USING (id = auth.uid());

-- ============================================================
-- 8. TEAM INVITES
-- ============================================================
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage invites for their teams or their email" ON public.team_invites;

CREATE POLICY "Users can manage invites for their teams or their email"
ON public.team_invites
FOR ALL
TO public
USING (
  (email = auth.email()) OR 
  (team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  ))
)
WITH CHECK (
  (email = auth.email()) OR 
  (team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  ))
);

-- ============================================================
-- 9. TEAM MEMBERS
-- ============================================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Delete Policy
DROP POLICY IF EXISTS "Users can delete their own membership" ON public.team_members;
CREATE POLICY "Users can delete their own membership"
ON public.team_members
FOR DELETE
TO public
USING (profile_id = auth.uid());

-- Select Policy
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.team_members;
CREATE POLICY "Users can view their own memberships"
ON public.team_members
FOR SELECT
TO public
USING (profile_id = auth.uid());

-- ============================================================
-- 10. TEAM ROLES
-- ============================================================
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage roles of teams they are members of" ON public.team_roles;

CREATE POLICY "Users can manage roles of teams they are members of"
ON public.team_roles
FOR ALL
TO public
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

-- ============================================================
-- 11. TEAMS
-- ============================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Insert Policy
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
ON public.teams
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- Select Policy
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
CREATE POLICY "Users can view teams they are members of"
ON public.teams
FOR SELECT
TO public
USING (
  id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.profile_id = auth.uid()
  )
);

COMMIT;