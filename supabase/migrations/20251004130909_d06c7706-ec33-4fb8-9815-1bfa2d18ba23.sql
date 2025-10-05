-- Drop all existing policies
drop policy if exists "Admins can manage their microgrid" on microgrids;
drop policy if exists "Users can view their microgrid" on microgrids;
drop policy if exists "Users can view their own record" on users;
drop policy if exists "Admins can manage users in their microgrid" on users;
drop policy if exists admin_all on homes;
drop policy if exists "Admins can manage homes in their microgrid" on homes;
drop policy if exists "Users can view their own home" on homes;
drop policy if exists user_read_tick on tick_state;
drop policy if exists "Admins can manage tick_state in their microgrid" on tick_state;
drop policy if exists "Users can view tick_state for their home" on tick_state;
drop policy if exists "Admins can manage tick_state_community in their microgrid" on tick_state_community;
drop policy if exists "Users can view tick_state_community for their microgrid" on tick_state_community;
drop policy if exists "Admins can manage rollup_daily_home in their microgrid" on rollup_daily_home;
drop policy if exists "Users can view rollup_daily_home for their home" on rollup_daily_home;
drop policy if exists "Admins can manage rollup_daily_community in their microgrid" on rollup_daily_community;
drop policy if exists "Users can view rollup_daily_community for their microgrid" on rollup_daily_community;
drop policy if exists "Admins can manage pool_ledger in their microgrid" on pool_ledger;
drop policy if exists "Users can view pool_ledger for their microgrid" on pool_ledger;
drop policy if exists "Admins can manage sim_events in their microgrid" on sim_events;
drop policy if exists "Users can view sim_events for their microgrid" on sim_events;
drop policy if exists "Admins can manage tariffs in their microgrid" on tariffs;
drop policy if exists "Users can view tariffs for their microgrid" on tariffs;
drop policy if exists "Admins can manage allocation_policies in their microgrid" on allocation_policies;
drop policy if exists "Users can view allocation_policies for their microgrid" on allocation_policies;
drop policy if exists "Admins can manage simulation_clock in their microgrid" on simulation_clock;
drop policy if exists "Users can view simulation_clock for their microgrid" on simulation_clock;

-- Security definer functions to avoid RLS recursion
create or replace function public.is_admin(_user_id uuid, _microgrid_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = _user_id
      and role = 'admin'
      and microgrid_id = _microgrid_id
  )
$$;

create or replace function public.get_user_home(_user_id uuid)
returns table(home_id text, microgrid_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select u.home_id, u.microgrid_id
  from public.users u
  where u.id = _user_id
    and u.role = 'user'
$$;

create or replace function public.get_user_microgrid(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select microgrid_id
  from public.users
  where id = _user_id
  limit 1
$$;

-- Microgrids policies
create policy "Admins can manage their microgrid"
on microgrids for all
using (public.is_admin(auth.uid(), id))
with check (public.is_admin(auth.uid(), id));

create policy "Users can view their microgrid"
on microgrids for select
using (id = public.get_user_microgrid(auth.uid()));

-- Users policies
create policy "Users can view their own record"
on users for select
using (id = auth.uid());

create policy "Admins can manage users in their microgrid"
on users for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

-- Homes policies
create policy "Admins can manage homes in their microgrid"
on homes for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view their own home"
on homes for select
using (
  exists (
    select 1 from public.get_user_home(auth.uid()) uh
    where uh.home_id = homes.id and uh.microgrid_id = homes.microgrid_id
  )
);

-- Tick state policies
create policy "Admins can manage tick_state in their microgrid"
on tick_state for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view tick_state for their home"
on tick_state for select
using (
  exists (
    select 1 from public.get_user_home(auth.uid()) uh
    where uh.home_id = tick_state.home_id and uh.microgrid_id = tick_state.microgrid_id
  )
);

-- Tick state community policies
create policy "Admins can manage tick_state_community in their microgrid"
on tick_state_community for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view tick_state_community for their microgrid"
on tick_state_community for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));

-- Rollup daily home policies
create policy "Admins can manage rollup_daily_home in their microgrid"
on rollup_daily_home for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view rollup_daily_home for their home"
on rollup_daily_home for select
using (
  exists (
    select 1 from public.get_user_home(auth.uid()) uh
    where uh.home_id = rollup_daily_home.home_id and uh.microgrid_id = rollup_daily_home.microgrid_id
  )
);

-- Rollup daily community policies
create policy "Admins can manage rollup_daily_community in their microgrid"
on rollup_daily_community for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view rollup_daily_community for their microgrid"
on rollup_daily_community for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));

-- Pool ledger policies
create policy "Admins can manage pool_ledger in their microgrid"
on pool_ledger for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view pool_ledger for their microgrid"
on pool_ledger for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));

-- Sim events policies
create policy "Admins can manage sim_events in their microgrid"
on sim_events for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view sim_events for their microgrid"
on sim_events for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));

-- Tariffs policies
create policy "Admins can manage tariffs in their microgrid"
on tariffs for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view tariffs for their microgrid"
on tariffs for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));

-- Allocation policies
create policy "Admins can manage allocation_policies in their microgrid"
on allocation_policies for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view allocation_policies for their microgrid"
on allocation_policies for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));

-- Simulation clock policies
create policy "Admins can manage simulation_clock in their microgrid"
on simulation_clock for all
using (public.is_admin(auth.uid(), microgrid_id))
with check (public.is_admin(auth.uid(), microgrid_id));

create policy "Users can view simulation_clock for their microgrid"
on simulation_clock for select
using (microgrid_id = public.get_user_microgrid(auth.uid()));