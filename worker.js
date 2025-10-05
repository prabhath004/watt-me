export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ 
        ok: true, 
        timestamp: new Date().toISOString(),
        message: "ShareWatt Simulator is running!"
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Stream endpoint - provides real-time data
    if (path === '/stream') {
      const data = {
        ts: new Date().toISOString(),
        homes: Array.from({ length: 25 }, (_, i) => ({
          id: `H${(i + 1).toString().padStart(3, '0')}`,
          pv: Math.round((Math.random() * 0.5) * 10) / 10,
          load: Math.round((1.0 + Math.random() * 0.5) * 10) / 10,
          soc: Math.round(12 + Math.random() * 10),
          share: 0,
          recv: 0,
          imp: 0,
          exp: 0,
          creditsDelta: 0,
        })),
        grid: { imp: 0, exp: 0 },
        community: { prod: 0, mg_used: 0, unserved: 0 },
      };

      return new Response(`data: ${JSON.stringify(data)}\n\n`, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...corsHeaders
        }
      });
    }

    // Admin state endpoint
    if (path === '/state/admin') {
      const response = {
        last_update_ts: new Date().toISOString(),
        grid: { to_grid_kw: 0, from_grid_kw: 0 },
        community_today: { production_kwh: 0, microgrid_used_kwh: 0 },
        fair_rate_cents_per_kwh: 18,
        homes: Array.from({ length: 25 }, (_, i) => ({
          id: `H${(i + 1).toString().padStart(3, '0')}`,
          pv_kw: Math.round(Math.random() * 5 * 10) / 10,
          usage_kw: Math.round((1 + Math.random()) * 10) / 10,
          sharing_kw: 0,
          receiving_kw: 0,
          soc_pct: Math.round(50 + Math.random() * 40),
          credits_net_kwh_mtd: 0,
        })),
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // User state endpoint
    if (path.startsWith('/state/user/')) {
      const homeId = path.split('/')[3];
      const response = {
        last_update_ts: new Date().toISOString(),
        home: {
          id: homeId,
          pv_kw: Math.round(Math.random() * 5 * 10) / 10,
          usage_kw: Math.round((1 + Math.random()) * 10) / 10,
          soc_pct: Math.round(50 + Math.random() * 40),
          sharing_kw: 0,
          receiving_kw: 0,
          grid_import_kw: 0,
          grid_export_kw: 0,
        },
        credits: { earned_today_kwh: 0, used_today_kwh: 0, mtd_net_kwh: 0 },
        economics: { baseline_cost_usd_today: 0, microgrid_cost_usd_today: 0, savings_usd_today: 0 },
        fair_rate_cents_per_kwh: 18,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
