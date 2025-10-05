-- Insert dummy users for testing
-- Note: This creates auth users and corresponding profile records

-- First, let's create a function to insert test users safely
CREATE OR REPLACE FUNCTION create_test_user(
  test_email TEXT,
  test_password TEXT,
  test_role role_t,
  test_microgrid_id UUID DEFAULT NULL,
  test_home_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create the auth user (this is a simplified version - in production use Supabase Admin API)
  -- For now, we'll just insert into the users table with a generated ID
  new_user_id := gen_random_uuid();
  
  INSERT INTO public.users (id, email, role, microgrid_id, home_id)
  VALUES (new_user_id, test_email, test_role, test_microgrid_id, test_home_id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- Create a test microgrid first
INSERT INTO public.microgrids (id, name, timezone)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Microgrid', 'America/New_York')
ON CONFLICT (id) DO NOTHING;

-- Create test homes
INSERT INTO public.homes (id, microgrid_id, label, pv_kwp, batt_capacity_kwh, batt_max_charge_kw, batt_max_discharge_kw, batt_soc_floor_pct, critical, policy_allow_discharge, household_scale)
VALUES 
  ('H1', '550e8400-e29b-41d4-a716-446655440000', 'Test Home 1', 5.0, 13.5, 5.0, 5.0, 20, false, true, 1.0),
  ('H2', '550e8400-e29b-41d4-a716-446655440000', 'Test Home 2', 7.2, 13.5, 5.0, 5.0, 20, false, true, 1.0)
ON CONFLICT (id, microgrid_id) DO NOTHING;

-- Note: To actually create authenticated users, you need to use the Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Then manually insert records into the users table with matching IDs

-- For reference, here are the test credentials you should create:
-- Admin: admin@demo.com / password123
-- User: user@demo.com / password123

COMMENT ON FUNCTION create_test_user IS 'Helper function for creating test users. After running this migration, create users via Supabase Dashboard: Authentication > Users > Add User, then link them in the users table.';
