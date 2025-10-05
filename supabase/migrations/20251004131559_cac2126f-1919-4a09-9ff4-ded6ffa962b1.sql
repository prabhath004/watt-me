-- ========== ENUMS ==========
do $$ begin
  if not exists (select 1 from pg_type where typname='role_t') then
    create type role_t as enum ('admin','user');
  end if;
  if not exists (select 1 from pg_type where typname='sim_mode_t') then
    create type sim_mode_t as enum ('paused','realtime','accelerated');
  end if;
  if not exists (select 1 from pg_type where typname='event_t') then
    create type event_t as enum ('OUTAGE','HEATWAVE','CLOUDBURST','EV_SURGE');
  end if;
  if not exists (select 1 from pg_type where typname='allocation_t') then
    create type allocation_t as enum ('equal_share','need_based','cap_per_home');
  end if;
end $$;

-- ========== MICROGRIDS ==========
create table if not exists microgrids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now()
);

-- ========== TARIFFS ==========
create table if not exists tariffs (
  id uuid primary key default gen_random_uuid(),
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  import_cents_per_kwh int not null check (import_cents_per_kwh >= 0),
  export_cents_per_kwh int not null check (export_cents_per_kwh >= 0),
  local_fair_rate_cents_per_kwh int not null check (local_fair_rate_cents_per_kwh >= 0),
  effective_from timestamptz not null,
  effective_to timestamptz
);
create index if not exists idx_tariffs_mg_time on tariffs(microgrid_id, effective_from, effective_to);

-- ========== HOMES (composite PK) ==========
create table if not exists homes (
  id text not null,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  label text,
  pv_kwp real not null check (pv_kwp >= 0),
  batt_capacity_kwh real not null check (batt_capacity_kwh >= 0),
  batt_max_charge_kw real not null check (batt_max_charge_kw >= 0),
  batt_max_discharge_kw real not null check (batt_max_discharge_kw >= 0),
  batt_soc_floor_pct int not null check (batt_soc_floor_pct between 0 and 100),
  household_scale real not null default 1.0 check (household_scale > 0),
  policy_allow_discharge boolean not null default true,
  critical boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (id, microgrid_id)
);
create index if not exists idx_homes_mg on homes(microgrid_id);
create index if not exists idx_homes_critical on homes(microgrid_id, critical);

-- ========== USERS (FK -> HOMES composite) ==========
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role role_t not null,
  microgrid_id uuid references microgrids(id) on delete set null,
  home_id text,
  created_at timestamptz not null default now()
);

-- add composite FK if missing
do $$
begin
  if not exists (
     select 1
     from information_schema.table_constraints
     where constraint_name = 'users_home_fk'
  ) then
    alter table users
      add constraint users_home_fk
      foreign key (home_id, microgrid_id)
      references homes(id, microgrid_id)
      deferrable initially deferred;
  end if;
end $$;

-- ========== SIMULATION CLOCK & POLICY ==========
create table if not exists simulation_clock (
  microgrid_id uuid primary key references microgrids(id) on delete cascade,
  mode sim_mode_t not null default 'accelerated',
  sim_time timestamptz not null default now(),
  speed real not null default 120.0,
  last_tick_at timestamptz
);

create table if not exists allocation_policies (
  microgrid_id uuid primary key references microgrids(id) on delete cascade,
  policy allocation_t not null default 'equal_share',
  per_home_cap_kw real,
  prioritize_critical boolean not null default true,
  day_soc_target_pct int not null default 75 check (day_soc_target_pct between 0 and 100),
  updated_at timestamptz not null default now()
);

-- ========== TICK STATE (per home) ==========
create table if not exists tick_state (
  ts timestamptz not null,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  home_id text not null,
  pv_w int not null check (pv_w >= 0),
  load_w int not null check (load_w >= 0),
  soc_pct int not null check (soc_pct between 0 and 100),
  sharing_w int not null check (sharing_w >= 0),
  receiving_w int not null check (receiving_w >= 0),
  grid_import_w int not null check (grid_import_w >= 0),
  grid_export_w int not null check (grid_export_w >= 0),
  credits_delta_wh int not null,
  primary key (ts, home_id, microgrid_id),
  constraint tick_home_fk foreign key (home_id, microgrid_id)
    references homes(id, microgrid_id) on delete cascade
);
create index if not exists idx_tick_mg_home_ts on tick_state(microgrid_id, home_id, ts desc);
create index if not exists idx_tick_ts on tick_state(ts desc);

-- ========== TICK COMMUNITY (per microgrid) ==========
create table if not exists tick_state_community (
  ts timestamptz not null,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  production_w int not null,
  microgrid_used_w int not null,
  grid_import_w int not null,
  grid_export_w int not null,
  unserved_w int not null default 0,
  primary key (ts, microgrid_id)
);
create index if not exists idx_tick_comm_mg_ts on tick_state_community(microgrid_id, ts desc);

-- ========== ROLLUPS ==========
create table if not exists rollup_daily_home (
  day date not null,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  home_id text not null,
  prod_wh int not null,
  use_wh int not null,
  mg_used_wh int not null,
  grid_import_wh int not null,
  grid_export_wh int not null,
  credits_net_wh int not null,
  primary key (day, home_id, microgrid_id),
  constraint roll_home_fk foreign key (home_id, microgrid_id)
    references homes(id, microgrid_id) on delete cascade
);
create index if not exists idx_roll_home_mg_day on rollup_daily_home(microgrid_id, day);

create table if not exists rollup_daily_community (
  day date not null,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  prod_wh int not null,
  mg_used_wh int not null,
  grid_import_wh int not null,
  grid_export_wh int not null,
  unserved_wh int not null,
  primary key (day, microgrid_id)
);

-- ========== POOL LEDGER (optional) ==========
create table if not exists pool_ledger (
  id bigserial primary key,
  ts timestamptz not null,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  from_home text not null,
  to_home text not null,
  kwh int not null check (kwh >= 0),
  constraint pool_from_fk foreign key (from_home, microgrid_id)
    references homes(id, microgrid_id) on delete cascade,
  constraint pool_to_fk foreign key (to_home, microgrid_id)
    references homes(id, microgrid_id) on delete cascade
);
create index if not exists idx_pool_mg_ts on pool_ledger(microgrid_id, ts);

-- ========== EVENTS ==========
create table if not exists sim_events (
  id bigserial primary key,
  microgrid_id uuid not null references microgrids(id) on delete cascade,
  ts_start timestamptz not null,
  ts_end timestamptz,
  type event_t not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_mg_time on sim_events(microgrid_id, ts_start, ts_end);

-- ========== VIEWS (drop/create to match definitions) ==========

drop view if exists v_home_latest;
create or replace view v_home_latest as
select distinct on (t.home_id, t.microgrid_id)
  t.microgrid_id, t.home_id, t.ts,
  t.pv_w, t.load_w, t.soc_pct, t.sharing_w, t.receiving_w,
  t.grid_import_w, t.grid_export_w
from tick_state t
order by t.home_id, t.microgrid_id, t.ts desc;

drop view if exists v_grid_exchange_now;
create or replace view v_grid_exchange_now as
select c.microgrid_id, c.ts,
       c.grid_export_w as to_grid_now_w_total,
       c.grid_import_w as from_grid_now_w_total
from tick_state_community c
join (
  select microgrid_id, max(ts) as ts
  from tick_state_community
  group by microgrid_id
) last on last.microgrid_id = c.microgrid_id and last.ts = c.ts;

drop view if exists v_community_today;
create or replace view v_community_today as
select
  r.microgrid_id,
  r.day,
  r.prod_wh,
  r.mg_used_wh,
  r.grid_import_wh,
  r.grid_export_wh,
  r.unserved_wh
from rollup_daily_community r;

drop view if exists v_user_today;
create or replace view v_user_today as
select
  t.microgrid_id,
  t.home_id,
  t.ts,
  t.pv_w,
  t.load_w,
  greatest(t.grid_export_w,0) as sent_to_grid_w
from tick_state t
where t.ts::date = current_date;

-- ========== SEED (safe if already exists) ==========
insert into microgrids (id, name) values ('00000000-0000-0000-0000-000000000001','NeighborGrid')
on conflict (id) do nothing;

insert into tariffs (microgrid_id, import_cents_per_kwh, export_cents_per_kwh, local_fair_rate_cents_per_kwh, effective_from)
values ('00000000-0000-0000-0000-000000000001', 30, 7, 18, now())
on conflict do nothing;

insert into allocation_policies (microgrid_id, policy, per_home_cap_kw, prioritize_critical, day_soc_target_pct)
values ('00000000-0000-0000-0000-000000000001','equal_share',2.0,true,75)
on conflict (microgrid_id) do nothing;

do $$
begin
  for i in 1..10 loop
    insert into homes (id, microgrid_id, label, pv_kwp, batt_capacity_kwh, batt_max_charge_kw, batt_max_discharge_kw, batt_soc_floor_pct, household_scale)
    values (('H'||i)::text,'00000000-0000-0000-0000-000000000001',('Home '||i), 4.5 + (i%3), 10, 3, 3, 15, 0.9 + (i%4)*0.05)
    on conflict (id, microgrid_id) do nothing;
  end loop;
end$$;

insert into users (email, role, microgrid_id, home_id)
values ('user-h7@neighborgrid.io','user','00000000-0000-0000-0000-000000000001','H7')
on conflict (email) do nothing;

insert into users (email, role, microgrid_id)
values ('admin@neighborgrid.io','admin','00000000-0000-0000-0000-000000000001')
on conflict (email) do nothing;