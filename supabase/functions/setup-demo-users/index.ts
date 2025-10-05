// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const DEMO_MICROGRID_ID = '00000000-0000-0000-0000-000000000001';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apike:: content-type',
};

// @ts-ignore
globalThis.addEventListener('fetch', async (event: any) => {
  const { request } = event;
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    event.respondWith(new Response(null, { headers: corsHeaders }));
    return;
  }

  try {
    console.log('Setting up demo users...');
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create demo admin user
    const { data: adminAuthData, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@demo.com',
      password: 'demo123',
      email_confirm: true
    });

    if (adminAuthError && !adminAuthError.message.includes('already registered')) {
      console.error('Admin auth error:', adminAuthError);
      throw adminAuthError;
    }
    
    console.log('Admin auth user created:', adminAuthData?.user?.id);

    // Insert admin user record
    if (adminAuthData?.user) {
      const { error: adminUserError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: adminAuthData.user.id,
          email: 'admin@demo.com',
          role: 'admin',
          microgrid_id: DEMO_MICROGRID_ID,
          home_id: null
        });

      if (adminUserError) {
        console.error('Admin user insert error:', adminUserError);
        throw adminUserError;
      }
      
      console.log('Admin user record created');
    }

    // Create demo regular user
    const { data: userAuthData, error: userAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'user@demo.com',
      password: 'demo123',
      email_confirm: true
    });

    if (userAuthError && !userAuthError.message.includes('already registered')) {
      console.error('User auth error:', userAuthError);
      throw userAuthError;
    }
    
    console.log('User auth user created:', userAuthData?.user?.id);

    // Insert regular user record
    if (userAuthData?.user) {
      const { error: userUserError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userAuthData.user.id,
          email: 'user@demo.com',
          role: 'user',
          microgrid_id: DEMO_MICROGRID_ID,
          home_id: 'H1'
        });

      if (userUserError) {
        console.error('User insert error:', userUserError);
        throw userUserError;
      }
      
      console.log('User record created');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo users created successfully',
        users: {
          admin: {
            email: 'admin@demo.com',
            password: ' ***',
            role: 'admin'
          },
          user: {
            email: 'user@demo.com',
            password: ' ***',
            role: 'user',
            home_id: 'H1'
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error setting up demo users:', errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
