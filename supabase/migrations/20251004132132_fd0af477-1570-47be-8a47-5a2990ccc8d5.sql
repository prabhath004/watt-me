-- 1) Make views "security invoker"
ALTER VIEW public.v_user_today         SET (security_invoker = on);
ALTER VIEW public.v_home_latest        SET (security_invoker = on);
ALTER VIEW public.v_grid_exchange_now  SET (security_invoker = on);
ALTER VIEW public.v_community_today    SET (security_invoker = on);

-- 2) Make sure RLS is ON for base tables
ALTER TABLE public.tick_state               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tick_state_community     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollup_daily_home        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollup_daily_community   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homes                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microgrids               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_policies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_clock         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_ledger              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_events               ENABLE ROW LEVEL SECURITY;

-- 3) Grant least privilege on the views
GRANT USAGE ON SCHEMA public TO authenticated;

-- Revoke any blanket grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant read-only on the views
GRANT SELECT ON public.v_user_today,
                 public.v_home_latest,
                 public.v_grid_exchange_now,
                 public.v_community_today
TO authenticated;

-- Grant SELECT on base tables for authenticated users (RLS will gate access)
GRANT SELECT ON public.microgrids,
                public.homes,
                public.users,
                public.tariffs,
                public.allocation_policies,
                public.simulation_clock,
                public.tick_state,
                public.tick_state_community,
                public.rollup_daily_home,
                public.rollup_daily_community,
                public.pool_ledger,
                public.sim_events
TO authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users (RLS policies will control access)
GRANT INSERT, UPDATE, DELETE ON public.tick_state,
                                 public.tick_state_community,
                                 public.rollup_daily_home,
                                 public.rollup_daily_community,
                                 public.pool_ledger,
                                 public.sim_events,
                                 public.homes,
                                 public.tariffs,
                                 public.allocation_policies,
                                 public.simulation_clock
TO authenticated;

-- 4) Add security barrier
ALTER VIEW public.v_user_today         SET (security_barrier = on);
ALTER VIEW public.v_home_latest        SET (security_barrier = on);
ALTER VIEW public.v_grid_exchange_now  SET (security_barrier = on);
ALTER VIEW public.v_community_today    SET (security_barrier = on);