/**
 * Cloudflare Pages Function for ShareWatt Simulator
 * This adapts your current SSE architecture for Cloudflare Pages
 */

// Simple simulation data (same as your current setup)
let simulationTime = new Date();
let outageActive = false;
let outageTimeLeft = 0;
let homes = Array.from({ length: 25 }, (_, i) => ({
  id: `H${(i + 1).toString().padStart(3, '0')}`,
  pv: Math.round((Math.random() * 0.5) * 10) / 10,
  load: Math.round((1.0 + Math.random() * 0.5) * 10) / 10,
  soc: Math.round(12 + Math.random() * 10),
  share: 0,
  recv: 0,
  imp: 0,
  exp: 0,
  creditsDelta: 0,
  credits_balance_kwh: 0,
  credits_delta_kwh: 0,
  earned_today_kwh: 0,
  used_today_kwh: 0,
  local_value_usd: 0,
  local_cost_usd: 0,
  baseline_cost_usd: 0,
  microgrid_cost_usd: 0,
  savings_usd: 0,
  import_kwh_today: 0,
  export_kwh_today: 0,
  residual_import_kwh_today: 0,
  residual_export_kwh_today: 0,
}));

const CONFIG = {
  FAIR_RATE: 0.18,
  RETAIL_IMPORT: 0.30,
  EXPORT_RATE: 0.07,
  MIN_CREDITS_FLOOR: -10,
  NEIGHBOR_THRESHOLD: 15,
};

// Process microgrid matches (same logic as your current setup)
function processMicrogridMatches() {
  homes.forEach(home => {
    home.credits_delta_kwh = 0;
    home.local_value_usd = 0;
    home.local_cost_usd = 0;
  });

  const producers = homes.filter(h => h.share > 0).sort((a, b) => b.share - a.share);
  const consumers = homes.filter(h => h.recv > 0).sort((a, b) => b.recv - a.recv);

  let totalMatched = 0;
  for (const producer of producers) {
    if (producer.share <= 0) continue;
    
    for (const consumer of consumers) {
      if (consumer.recv <= 0) continue;
      
      if (consumer.credits_balance_kwh < CONFIG.MIN_CREDITS_FLOOR) continue;
      if (producer.soc < CONFIG.NEIGHBOR_THRESHOLD) continue;
      
      const matched_kwh = Math.min(producer.share, consumer.recv);
      if (matched_kwh <= 0) continue;
      
      producer.credits_delta_kwh += matched_kwh;
      consumer.credits_delta_kwh -= matched_kwh;
      producer.local_value_usd += matched_kwh * CONFIG.FAIR_RATE;
      consumer.local_cost_usd += matched_kwh * CONFIG.FAIR_RATE;
      
      producer.share -= matched_kwh;
      consumer.recv -= matched_kwh;
      totalMatched += matched_kwh;
    }
  }
  
  homes.forEach(home => {
    home.credits_balance_kwh += home.credits_delta_kwh;
    if (home.credits_delta_kwh > 0) {
      home.earned_today_kwh += home.credits_delta_kwh;
    } else if (home.credits_delta_kwh < 0) {
      home.used_today_kwh += Math.abs(home.credits_delta_kwh);
    }
  });
}

// Update simulation data (same logic as your current setup)
function updateSimulation() {
  simulationTime = new Date(simulationTime.getTime() + 15 * 60 * 1000);
  
  if (outageActive && outageTimeLeft > 0) {
    outageTimeLeft -= 15;
    if (outageTimeLeft <= 0) {
      outageActive = false;
    }
  }
  
  const hour = simulationTime.getHours();
  
  homes = homes.map(home => {
    const solarMultiplier = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
    const pv = Math.max(0, solarMultiplier * 6 + (Math.random() - 0.5) * 1);
    
    let load = 0.8;
    if (hour >= 6 && hour <= 9) load = 1.2 + (hour - 6) * 0.1;
    else if (hour >= 17 && hour <= 22) load = 1.5 + (hour - 17) * 0.2;
    else if (hour >= 22 || hour <= 6) load = 0.6;
    
    const energyBalance = pv - load;
    let gridImport = 0;
    let gridExport = 0;
    let sharing = 0;
    let receiving = 0;
    
    if (outageActive) {
      if (energyBalance > 0) {
        sharing = Math.min(energyBalance * 0.8, 3.0);
        gridExport = 0;
      } else if (energyBalance < 0) {
        receiving = Math.min(Math.abs(energyBalance) * 0.6, 2.5);
        gridImport = 0;
      }
    } else {
      if (energyBalance > 0) {
        sharing = Math.min(energyBalance * 0.6, 2.0);
        gridExport = Math.max(0, energyBalance - sharing);
      } else if (energyBalance < 0) {
        receiving = Math.min(Math.abs(energyBalance) * 0.4, 1.5);
        gridImport = Math.max(0, Math.abs(energyBalance) - receiving);
      }
    }
    
    return {
      ...home,
      pv: Math.round(pv * 10) / 10,
      load: Math.round(load * 10) / 10,
      soc: Math.round(Math.max(5, Math.min(95, home.soc + (pv - load) * 0.1))),
      share: Math.round(sharing * 10) / 10,
      recv: Math.round(receiving * 10) / 10,
      imp: Math.round(gridImport * 10) / 10,
      exp: Math.round(gridExport * 10) / 10,
      creditsDelta: Math.round((sharing - receiving) * 10) / 10,
    };
  });
  
  processMicrogridMatches();
  
  homes.forEach(home => {
    home.import_kwh_today += home.imp;
    home.export_kwh_today += home.exp;
    home.residual_import_kwh_today += home.imp;
    home.residual_export_kwh_today += home.exp;
    
    home.baseline_cost_usd = (home.import_kwh_today * CONFIG.RETAIL_IMPORT) - (home.export_kwh_today * CONFIG.EXPORT_RATE);
    home.microgrid_cost_usd = home.local_cost_usd + (home.residual_import_kwh_today * CONFIG.RETAIL_IMPORT) - (home.residual_export_kwh_today * CONFIG.EXPORT_RATE);
    home.savings_usd = home.baseline_cost_usd - home.microgrid_cost_usd;
  });
}

// Cloudflare Pages Function handler
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': env.FRONTEND_URL || 'http://localhost:8080',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
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
      homes_count: homes.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // SSE Stream endpoint
  if (path === '/stream') {
    // Update simulation data
    updateSimulation();
    
    const data = {
      ts: simulationTime.toISOString(),
      homes: homes.map(h => ({
        ...h,
        credits_balance_kwh: Math.round(h.credits_balance_kwh * 10) / 10,
        earned_today_kwh: Math.round(h.earned_today_kwh * 10) / 10,
        used_today_kwh: Math.round(h.used_today_kwh * 10) / 10,
        local_value_usd: Math.round(h.local_value_usd * 100) / 100,
        local_cost_usd: Math.round(h.local_cost_usd * 100) / 100,
        baseline_cost_usd: Math.round(h.baseline_cost_usd * 100) / 100,
        microgrid_cost_usd: Math.round(h.microgrid_cost_usd * 100) / 100,
        savings_usd: Math.round(h.savings_usd * 100) / 100,
      })),
      grid: {
        imp: Math.round(homes.reduce((sum, h) => sum + h.imp, 0) * 10) / 10,
        exp: Math.round(homes.reduce((sum, h) => sum + h.exp, 0) * 10) / 10,
      },
      community: {
        prod: Math.round(homes.reduce((sum, h) => sum + h.pv, 0) * 10) / 10,
        mg_used: Math.round(homes.reduce((sum, h) => sum + h.share, 0) * 10) / 10,
        unserved: 0,
        savings_usd: Math.round(homes.reduce((sum, h) => sum + h.savings_usd, 0) * 100) / 100,
        credits_earned_today: Math.round(homes.reduce((sum, h) => sum + h.earned_today_kwh, 0) * 10) / 10,
        credits_used_today: Math.round(homes.reduce((sum, h) => sum + h.used_today_kwh, 0) * 10) / 10,
      },
    };

    // Return SSE response
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
    updateSimulation();
    
    const totalExp = homes.reduce((sum, h) => sum + h.exp, 0);
    const totalImp = homes.reduce((sum, h) => sum + h.imp, 0);
    const totalPv = homes.reduce((sum, h) => sum + h.pv, 0);
    const totalShare = homes.reduce((sum, h) => sum + h.share, 0);
    const communitySavings = homes.reduce((sum, h) => sum + h.savings_usd, 0);
    const totalCreditsEarned = homes.reduce((sum, h) => sum + h.earned_today_kwh, 0);
    const totalCreditsUsed = homes.reduce((sum, h) => sum + h.used_today_kwh, 0);
    
    const response = {
      last_update_ts: simulationTime.toISOString(),
      grid: {
        to_grid_kw: Math.round(totalExp * 10) / 10,
        from_grid_kw: Math.round(totalImp * 10) / 10,
        to_grid_today_kwh: Math.round(totalExp * 0.25 * 10) / 10,
        from_grid_today_kwh: Math.round(totalImp * 0.25 * 10) / 10,
        top_exporters: homes.filter(h => h.exp > 0.1).slice(0, 5).map(h => ({ home: h.id, kw: Math.round(h.exp * 10) / 10 })),
        drawing_now: homes.filter(h => h.imp > 0.1).slice(0, 5).map(h => ({ home: h.id, kw: Math.round(h.imp * 10) / 10 })),
      },
      community_today: {
        production_kwh: Math.round(totalPv * 0.25 * 10) / 10,
        microgrid_used_kwh: Math.round(totalShare * 0.25 * 10) / 10,
        grid_import_kwh: Math.round(totalImp * 0.25 * 10) / 10,
        grid_export_kwh: Math.round(totalExp * 0.25 * 10) / 10,
        unserved_kwh: 0,
        savings_usd: Math.round(communitySavings * 100) / 100,
        credits_earned_today: Math.round(totalCreditsEarned * 10) / 10,
        credits_used_today: Math.round(totalCreditsUsed * 10) / 10,
      },
      fair_rate_cents_per_kwh: Math.round(CONFIG.FAIR_RATE * 100),
      homes: homes.map(h => ({
        id: h.id,
        pv_kw: Math.round(h.pv * 10) / 10,
        usage_kw: Math.round(h.load * 10) / 10,
        sharing_kw: Math.round(h.share * 10) / 10,
        receiving_kw: Math.round(h.recv * 10) / 10,
        soc_pct: Math.round(h.soc),
        credits_net_kwh_mtd: Math.round(h.creditsDelta * 10) / 10,
        credits_balance_kwh: Math.round(h.credits_balance_kwh * 10) / 10,
        earned_today_kwh: Math.round(h.earned_today_kwh * 10) / 10,
        used_today_kwh: Math.round(h.used_today_kwh * 10) / 10,
        savings_usd: Math.round(h.savings_usd * 100) / 100,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // User state endpoint
  if (path.startsWith('/state/user/')) {
    updateSimulation();
    
    const homeId = path.split('/')[3];
    const home = homes.find(h => h.id === homeId);
    
    if (!home) {
      return new Response(JSON.stringify({ error: 'Home not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const response = {
      last_update_ts: simulationTime.toISOString(),
      home: {
        id: home.id,
        pv_kw: Math.round(home.pv * 10) / 10,
        usage_kw: Math.round(home.load * 10) / 10,
        soc_pct: Math.round(home.soc),
        sharing_kw: Math.round(home.share * 10) / 10,
        receiving_kw: Math.round(home.recv * 10) / 10,
        grid_import_kw: Math.round(home.imp * 10) / 10,
        grid_export_kw: Math.round(home.exp * 10) / 10,
      },
      credits: {
        earned_today_kwh: Math.round(home.earned_today_kwh * 10) / 10,
        used_today_kwh: Math.round(home.used_today_kwh * 10) / 10,
        mtd_net_kwh: Math.round(home.credits_balance_kwh * 10) / 10,
        local_value_usd_today: Math.round(home.local_value_usd * 100) / 100,
        local_cost_usd_today: Math.round(home.local_cost_usd * 100) / 100,
      },
      economics: {
        baseline_cost_usd_today: Math.round(home.baseline_cost_usd * 100) / 100,
        microgrid_cost_usd_today: Math.round(home.microgrid_cost_usd * 100) / 100,
        savings_usd_today: Math.round(home.savings_usd * 100) / 100,
      },
      fair_rate_cents_per_kwh: Math.round(CONFIG.FAIR_RATE * 100),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Event endpoint
  if (path === '/sim/event' && request.method === 'POST') {
    const body = await request.json();
    const { type, duration_min } = body;
    
    if (type === 'OUTAGE') {
      outageActive = true;
      outageTimeLeft = duration_min;
    }
    
    return new Response(JSON.stringify({ success: true, event: type, duration: duration_min }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Reset endpoint
  if (path === '/sim/reset' && request.method === 'POST') {
    simulationTime = new Date();
    return new Response(JSON.stringify({ success: true, message: 'Simulation reset' }), {
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
