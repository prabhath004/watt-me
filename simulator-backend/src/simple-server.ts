/**
 * Simple Simulator Server - Basic working version
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

// Middleware
app.use(cors({ 
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true 
}));
app.use(express.json());

// SSE clients
const sseClients: express.Response[] = [];

// Configuration constants
const CONFIG = {
  FAIR_RATE: 0.18,        // $/kWh for microgrid transactions
  RETAIL_IMPORT: 0.30,    // $/kWh for grid import
  EXPORT_RATE: 0.07,       // $/kWh for grid export
  MIN_CREDITS_FLOOR: -10,  // kWh minimum credits balance
  NEIGHBOR_THRESHOLD: 15,  // % SOC threshold for sharing
};

// Simple simulation data
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
  // Credits and economics tracking
  credits_balance_kwh: 0,
  credits_delta_kwh: 0,
  earned_today_kwh: 0,
  used_today_kwh: 0,
  local_value_usd: 0,
  local_cost_usd: 0,
  baseline_cost_usd: 0,
  microgrid_cost_usd: 0,
  savings_usd: 0,
  // Daily tracking
  import_kwh_today: 0,
  export_kwh_today: 0,
  residual_import_kwh_today: 0,
  residual_export_kwh_today: 0,
}));

// Process microgrid matches and update credits
function processMicrogridMatches() {
  // Reset deltas for this tick
  homes.forEach(home => {
    home.credits_delta_kwh = 0;
    home.local_value_usd = 0;
    home.local_cost_usd = 0;
  });

  // Simple matching algorithm: match excess producers with deficit consumers
  const producers = homes.filter(h => h.share > 0).sort((a, b) => b.share - a.share);
  const consumers = homes.filter(h => h.recv > 0).sort((a, b) => b.recv - a.recv);

  let totalMatched = 0;
  for (const producer of producers) {
    if (producer.share <= 0) continue;
    
    for (const consumer of consumers) {
      if (consumer.recv <= 0) continue;
      
      // Check if consumer can participate (credits floor check)
      if (consumer.credits_balance_kwh < CONFIG.MIN_CREDITS_FLOOR) continue;
      
      // Check if producer can share (SOC threshold check)
      if (producer.soc < CONFIG.NEIGHBOR_THRESHOLD) continue;
      
      const matched_kwh = Math.min(producer.share, consumer.recv);
      if (matched_kwh <= 0) continue;
      
      // Update credits and economics
      producer.credits_delta_kwh += matched_kwh;
      consumer.credits_delta_kwh -= matched_kwh;
      producer.local_value_usd += matched_kwh * CONFIG.FAIR_RATE;
      consumer.local_cost_usd += matched_kwh * CONFIG.FAIR_RATE;
      
      // Update remaining capacity
      producer.share -= matched_kwh;
      consumer.recv -= matched_kwh;
      totalMatched += matched_kwh;
      
      console.log(`🔄 Match: ${producer.id} → ${consumer.id}, ${matched_kwh.toFixed(2)} kWh, $${(matched_kwh * CONFIG.FAIR_RATE).toFixed(2)}`);
    }
  }
  
  // Update balances
  homes.forEach(home => {
    home.credits_balance_kwh += home.credits_delta_kwh;
    if (home.credits_delta_kwh > 0) {
      home.earned_today_kwh += home.credits_delta_kwh;
    } else if (home.credits_delta_kwh < 0) {
      home.used_today_kwh += Math.abs(home.credits_delta_kwh);
    }
  });
  
  // Log invariants
  const totalCreditsDelta = homes.reduce((sum, h) => sum + h.credits_delta_kwh, 0);
  if (Math.abs(totalCreditsDelta) > 0.01) {
    console.warn(`⚠️ Credits invariant broken: total delta = ${totalCreditsDelta.toFixed(3)} kWh`);
  }
  
  console.log(`📊 Microgrid: ${totalMatched.toFixed(2)} kWh matched, $${(totalMatched * CONFIG.FAIR_RATE).toFixed(2)} value`);
}

// Start simulation loop
setInterval(() => {
  // Advance time by 15 minutes
  simulationTime = new Date(simulationTime.getTime() + 15 * 60 * 1000);
  
  // Update outage timer
  if (outageActive && outageTimeLeft > 0) {
    outageTimeLeft -= 15; // Reduce by 15 minutes
    if (outageTimeLeft <= 0) {
      outageActive = false;
      console.log('⚡ Grid outage ended - normal operations resumed');
    }
  }
  
  // Update simulation data
  const hour = simulationTime.getHours();
  
  homes = homes.map(home => {
    // Solar generation (peaks at noon)
    const solarMultiplier = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
    const pv = Math.max(0, solarMultiplier * 6 + (Math.random() - 0.5) * 1);
    
    // Load profile
    let load = 0.8;
    if (hour >= 6 && hour <= 9) load = 1.2 + (hour - 6) * 0.1;
    else if (hour >= 17 && hour <= 22) load = 1.5 + (hour - 17) * 0.2;
    else if (hour >= 22 || hour <= 6) load = 0.6;
    
    // Energy balance
    const energyBalance = pv - load;
    let gridImport = 0;
    let gridExport = 0;
    let sharing = 0;
    let receiving = 0;
    
    if (outageActive) {
      // During outage: no grid import/export, increased microgrid sharing
      if (energyBalance > 0) {
        sharing = Math.min(energyBalance * 0.8, 3.0); // Increased sharing during outage
        gridExport = 0; // No grid export during outage
      } else if (energyBalance < 0) {
        receiving = Math.min(Math.abs(energyBalance) * 0.6, 2.5); // Increased receiving during outage
        gridImport = 0; // No grid import during outage
      }
    } else {
      // Normal operation
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
      pv: Math.round(pv * 10) / 10, // 1 decimal place
      load: Math.round(load * 10) / 10, // 1 decimal place
      soc: Math.round(Math.max(5, Math.min(95, home.soc + (pv - load) * 0.1))), // No decimals
      share: Math.round(sharing * 10) / 10, // 1 decimal place
      recv: Math.round(receiving * 10) / 10, // 1 decimal place
      imp: Math.round(gridImport * 10) / 10, // 1 decimal place
      exp: Math.round(gridExport * 10) / 10, // 1 decimal place
      creditsDelta: Math.round((sharing - receiving) * 10) / 10, // 1 decimal place
    };
  });
  
  // Process microgrid matches
  processMicrogridMatches();
  
  // Calculate economics for each home
  homes.forEach(home => {
    // Update daily tracking
    home.import_kwh_today += home.imp;
    home.export_kwh_today += home.exp;
    home.residual_import_kwh_today += home.imp;
    home.residual_export_kwh_today += home.exp;
    
    // Calculate baseline vs microgrid costs
    home.baseline_cost_usd = (home.import_kwh_today * CONFIG.RETAIL_IMPORT) - (home.export_kwh_today * CONFIG.EXPORT_RATE);
    home.microgrid_cost_usd = home.local_cost_usd + (home.residual_import_kwh_today * CONFIG.RETAIL_IMPORT) - (home.residual_export_kwh_today * CONFIG.EXPORT_RATE);
    home.savings_usd = home.baseline_cost_usd - home.microgrid_cost_usd;
  });
  
  // Calculate community totals
  const communitySavings = homes.reduce((sum, h) => sum + h.savings_usd, 0);
  const totalCreditsEarned = homes.reduce((sum, h) => sum + h.earned_today_kwh, 0);
  const totalCreditsUsed = homes.reduce((sum, h) => sum + h.used_today_kwh, 0);
  
  // Broadcast to all SSE clients
  const data = {
    ts: simulationTime.toISOString(),
    homes: homes.map(h => ({
      ...h,
      // Round for API response
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
      savings_usd: Math.round(communitySavings * 100) / 100,
      credits_earned_today: Math.round(totalCreditsEarned * 10) / 10,
      credits_used_today: Math.round(totalCreditsUsed * 10) / 10,
    },
  };
  
  sseClients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error("SSE write error:", err);
    }
  });
}, 2000); // Update every 2 seconds

// Routes
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/stream", (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:8080'
  });
  res.flushHeaders();

  // Send initial state
  const data = {
    ts: simulationTime.toISOString(),
    homes,
    grid: {
      imp: homes.reduce((sum, h) => sum + h.imp, 0),
      exp: homes.reduce((sum, h) => sum + h.exp, 0),
    },
    community: {
      prod: homes.reduce((sum, h) => sum + h.pv, 0),
      mg_used: homes.reduce((sum, h) => sum + h.share, 0),
      unserved: 0,
    },
  };
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Add client to list
  sseClients.push(res);

  // Remove client on disconnect
  req.on("close", () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

app.get("/state/admin", (req, res) => {
  const totalExp = homes.reduce((sum, h) => sum + h.exp, 0);
  const totalImp = homes.reduce((sum, h) => sum + h.imp, 0);
  const totalPv = homes.reduce((sum, h) => sum + h.pv, 0);
  const totalShare = homes.reduce((sum, h) => sum + h.share, 0);
  const communitySavings = homes.reduce((sum, h) => sum + h.savings_usd, 0);
  const totalCreditsEarned = homes.reduce((sum, h) => sum + h.earned_today_kwh, 0);
  const totalCreditsUsed = homes.reduce((sum, h) => sum + h.used_today_kwh, 0);
  
  res.json({
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
  });
});

// User state endpoint for individual home
app.get("/state/user/:homeId", (req, res) => {
  const { homeId } = req.params;
  const home = homes.find(h => h.id === homeId);
  
  if (!home) {
    return res.status(404).json({ error: 'Home not found' });
  }
  
  res.json({
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
  });
});

// Event endpoint for triggering simulation events
app.post('/sim/event', (req, res) => {
  const { type, duration_min } = req.body;
  console.log(`🎯 Event triggered: ${type} for ${duration_min} minutes`);
  
  // Handle different event types
  if (type === 'OUTAGE') {
    // During outage, reduce grid availability and increase microgrid sharing
    outageActive = true;
    outageTimeLeft = duration_min;
    console.log(`⚡ Grid outage simulation activated for ${duration_min} minutes`);
  } else if (type === 'CLOUDBURST') {
    // Reduce solar generation
    console.log('🌧️ Cloudburst simulation activated');
  } else if (type === 'HEATWAVE') {
    // Increase load due to AC usage
    console.log('🔥 Heatwave simulation activated');
  } else if (type === 'EV_SURGE') {
    // Increase load from EV charging
    console.log('🚗 EV surge simulation activated');
  }
  
  res.json({ success: true, event: type, duration: duration_min });
});

// Reset endpoint
app.post('/sim/reset', (req, res) => {
  console.log('🔄 Simulation reset requested');
  simulationTime = new Date();
  res.json({ success: true, message: 'Simulation reset' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Simulator backend running on http://${HOST}:${PORT}`);
  console.log(`📡 SSE stream available at http://${HOST}:${PORT}/stream`);
  console.log(`🏥 Health check available at http://${HOST}:${PORT}/health`);
});
