-- Insert demo data for the existing microgrid
-- First, insert some homes if they don't exist
INSERT INTO homes (id, microgrid_id, pv_kwp, batt_capacity_kwh, batt_max_charge_kw, batt_max_discharge_kw, batt_soc_floor_pct, critical, policy_allow_discharge, household_scale, label)
VALUES 
  ('H1', '00000000-0000-0000-0000-000000000001', 5.0, 10.0, 5.0, 5.0, 20, false, true, 1.0, 'Solar Home 1'),
  ('H2', '00000000-0000-0000-0000-000000000001', 6.0, 13.5, 5.0, 5.0, 20, false, true, 1.2, 'Solar Home 2'),
  ('H3', '00000000-0000-0000-0000-000000000001', 4.5, 10.0, 5.0, 5.0, 20, true, true, 0.9, 'Solar Home 3 (Critical)'),
  ('H7', '00000000-0000-0000-0000-000000000001', 5.5, 13.5, 5.0, 5.0, 20, false, true, 1.1, 'Solar Home 7')
ON CONFLICT (id, microgrid_id) DO NOTHING;

-- Insert current tick state for homes
INSERT INTO tick_state (microgrid_id, home_id, ts, pv_w, load_w, soc_pct, sharing_w, receiving_w, grid_import_w, grid_export_w, credits_delta_wh)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'H1', NOW(), 3500, 1200, 75, 2300, 0, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000001', 'H2', NOW(), 4200, 1500, 68, 2700, 0, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000001', 'H3', NOW(), 2800, 2000, 82, 0, 800, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000001', 'H7', NOW(), 3800, 1800, 71, 2000, 0, 0, 0, 0)
ON CONFLICT (microgrid_id, home_id, ts) DO UPDATE
SET pv_w = EXCLUDED.pv_w, load_w = EXCLUDED.load_w, soc_pct = EXCLUDED.soc_pct;

-- Insert community tick state
INSERT INTO tick_state_community (microgrid_id, ts, production_w, microgrid_used_w, grid_import_w, grid_export_w, unserved_w)
VALUES 
  ('00000000-0000-0000-0000-000000000001', NOW(), 14300, 6500, 0, 7800, 0)
ON CONFLICT (microgrid_id, ts) DO UPDATE
SET production_w = EXCLUDED.production_w, microgrid_used_w = EXCLUDED.microgrid_used_w;

-- Insert tariff data
INSERT INTO tariffs (microgrid_id, effective_from, import_cents_per_kwh, export_cents_per_kwh, local_fair_rate_cents_per_kwh)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '2025-01-01', 25, 8, 12)
ON CONFLICT DO NOTHING;

-- Insert daily rollup data for homes
INSERT INTO rollup_daily_home (microgrid_id, home_id, day, prod_wh, use_wh, mg_used_wh, grid_import_wh, grid_export_wh, credits_net_wh)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'H7', CURRENT_DATE, 28000, 18000, 5000, 0, 10000, 5000)
ON CONFLICT (microgrid_id, home_id, day) DO NOTHING;