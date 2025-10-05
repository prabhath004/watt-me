/**
 * Section 7: API Server with SSE streaming
 */

import express from "express";
import cors from "cors";
import { MicrogridEngine } from "./engine.js";
import type { AdminStateResponse, UserStateResponse, SSEDelta } from "./types.js";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize engine
const engine = new MicrogridEngine(42);

// SSE clients
const sseClients: express.Response[] = [];

// Start simulation
engine.start("accelerated");

// Listen for ticks and broadcast via SSE
engine.on("tick", (delta: SSEDelta) => {
  const data = `data: ${JSON.stringify(delta)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(data);
    } catch (err) {
      console.error("SSE write error:", err);
    }
  });
});

// Section 7: API Endpoints

/**
 * GET /state/admin - Admin dashboard state
 */
app.get("/state/admin", (req, res) => {
  const state = engine.getCurrentState();
  const rollup = engine.getDailyRollup();
  const config = engine.getConfig();

  if (!state || !rollup) {
    return res.status(503).json({ error: "Simulation not ready" });
  }

  // Build response (all numbers rounded to integers)
  const response: AdminStateResponse = {
    last_update_ts: state.timestamp.toISOString(),
    grid: {
      to_grid_kw: Math.round(state.community_totals.grid_export_kw),
      from_grid_kw: Math.round(state.community_totals.grid_import_kw),
      to_grid_today_kwh: Math.round(rollup.grid_export_kwh),
      from_grid_today_kwh: Math.round(rollup.grid_import_kwh),
      top_exporters: state.homes
        .filter(h => h.grid_out_kw > 0.1)
        .sort((a, b) => b.grid_out_kw - a.grid_out_kw)
        .slice(0, 5)
        .map(h => ({ home: h.id, kw: Math.round(h.grid_out_kw) })),
      drawing_now: state.homes
        .filter(h => h.grid_in_kw > 0.1)
        .sort((a, b) => b.grid_in_kw - a.grid_in_kw)
        .slice(0, 5)
        .map(h => ({ home: h.id, kw: Math.round(h.grid_in_kw) }))
    },
    community_today: {
      production_kwh: Math.round(rollup.production_kwh),
      microgrid_used_kwh: Math.round(rollup.microgrid_used_kwh),
      grid_import_kwh: Math.round(rollup.grid_import_kwh),
      grid_export_kwh: Math.round(rollup.grid_export_kwh),
      unserved_kwh: Math.round(rollup.unserved_kwh)
    },
    fair_rate_cents_per_kwh: config.fair_rate_cents_per_kwh,
    homes: state.homes.map(h => ({
      id: h.id,
      pv_kw: Math.round(h.pv_kw),
      usage_kw: Math.round(h.load_kw),
      sharing_kw: Math.round(h.share_kw),
      receiving_kw: Math.round(h.recv_kw),
      soc_pct: Math.round((h.soc_kwh / h.battery_capacity_kwh) * 100),
      credits_net_kwh_mtd: Math.round(h.credits_balance_kwh)
    }))
  };

  res.json(response);
});

/**
 * GET /state/user/:homeId - User-specific state
 */
app.get("/state/user/:homeId", (req, res) => {
  const { homeId } = req.params;
  const state = engine.getCurrentState();
  const rollup = engine.getDailyRollup();

  if (!state || !rollup) {
    return res.status(503).json({ error: "Simulation not ready" });
  }

  const home = state.homes.find(h => h.id === homeId);
  const homeRollup = rollup.homes.find(h => h.id === homeId);

  if (!home || !homeRollup) {
    return res.status(404).json({ error: "Home not found" });
  }

  // Build chart data (last 24 hours, sampled every 15 minutes)
  const chartData = {
    solar_kw: [] as number[],
    consumption_kw: [] as number[],
    to_grid_kw: [] as number[]
  };

  // For simplicity, use current values repeated (in production, use historical data)
  for (let i = 0; i < 96; i++) { // 24 hours * 4 samples/hour
    chartData.solar_kw.push(Math.round(home.pv_kw));
    chartData.consumption_kw.push(Math.round(home.load_kw));
    chartData.to_grid_kw.push(Math.round(home.grid_out_kw));
  }

  const response: UserStateResponse = {
    energy_summary: {
      solar_kw: Math.round(home.pv_kw),
      consumed_kw: Math.round(home.load_kw),
      surplus_today_kwh: Math.round(homeRollup.shared_kwh)
    },
    battery: {
      soc_pct: Math.round((home.soc_kwh / home.battery_capacity_kwh) * 100),
      charged_today_kwh: Math.round(homeRollup.produced_kwh - homeRollup.shared_kwh),
      discharged_today_kwh: Math.round(homeRollup.consumed_kwh - homeRollup.produced_kwh)
    },
    sharing: {
      sharing_now_kw: Math.round(home.share_kw),
      receiving_now_kw: Math.round(home.recv_kw),
      peers: state.homes
        .filter(h => h.id !== homeId && (h.share_kw > 0.1 || h.recv_kw > 0.1))
        .map(h => h.id)
    },
    credits: {
      mtd_net_kwh: Math.round(home.credits_balance_kwh),
      earned_today_kwh: Math.round(Math.max(0, homeRollup.credits_net_kwh)),
      used_today_kwh: Math.round(Math.max(0, -homeRollup.credits_net_kwh))
    },
    chart_today: chartData
  };

  res.json(response);
});

/**
 * GET /stream - SSE endpoint for real-time updates
 */
app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial state
  const state = engine.getCurrentState();
  if (state) {
    const delta: SSEDelta = {
      ts: state.timestamp.toISOString(),
      homes: state.homes.map(h => ({
        id: h.id,
        pv: Math.round(h.pv_kw),
        load: Math.round(h.load_kw),
        soc: Math.round((h.soc_kwh / h.battery_capacity_kwh) * 100),
        share: Math.round(h.share_kw * 100) / 100,
        recv: Math.round(h.recv_kw * 100) / 100,
        imp: Math.round(h.grid_in_kw * 100) / 100,
        exp: Math.round(h.grid_out_kw * 100) / 100,
        creditsDelta: Math.round(h.credits_delta_kwh * 1000) / 1000
      })),
      grid: {
        imp: Math.round(state.community_totals.grid_import_kw),
        exp: Math.round(state.community_totals.grid_export_kw)
      },
      community: {
        prod: Math.round(state.community_totals.production_kw),
        mg_used: Math.round(state.community_totals.microgrid_used_kw * 100) / 100,
        unserved: Math.round(state.community_totals.unserved_kw * 100) / 100
      }
    };
    res.write(`data: ${JSON.stringify(delta)}\n\n`);
  }

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

/**
 * POST /sim/reset - Reset simulation
 */
app.post("/sim/reset", (req, res) => {
  const seed = parseInt(req.query.seed as string) || 42;
  const mode = (req.query.mode as "realtime" | "accelerated") || "accelerated";
  
  engine.reset(seed, mode);
  engine.start(mode);
  
  console.log(`🔄 Simulation reset with seed ${seed}, mode ${mode}`);
  res.json({ message: "Simulation reset", seed, mode });
});

/**
 * POST /sim/event - Add event
 */
app.post("/sim/event", (req, res) => {
  const { type, duration_min, params } = req.body;
  
  if (!type || !duration_min) {
    return res.status(400).json({ error: "Missing type or duration_min" });
  }

  engine.addEvent(type, duration_min, params);
  res.json({ message: "Event added", type, duration_min });
});

/**
 * POST /sim/policy - Update policy
 */
app.post("/sim/policy", (req, res) => {
  const { allocation, fair_rate_cents } = req.body;
  
  if (!allocation) {
    return res.status(400).json({ error: "Missing allocation" });
  }

  engine.updatePolicy(allocation, fair_rate_cents);
  res.json({ message: "Policy updated", allocation, fair_rate_cents });
});

/**
 * POST /sim/pause - Pause simulation
 */
app.post("/sim/pause", (req, res) => {
  engine.pause();
  res.json({ message: "Simulation paused" });
});

/**
 * POST /sim/resume - Resume simulation
 */
app.post("/sim/resume", (req, res) => {
  engine.resume();
  res.json({ message: "Simulation resumed" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🏘️  ShareWatt Live Simulator                         ║
║  ⚡ Server running on http://localhost:${PORT}              ║
║  📊 Admin state: GET /state/admin                         ║
║  👤 User state: GET /state/user/:homeId                   ║
║  📡 SSE stream: GET /stream                               ║
║  🎮 Control: POST /sim/reset, /sim/event, /sim/policy    ║
╚═══════════════════════════════════════════════════════════╝

🚀 Simulation started in ACCELERATED mode (1 min = 0.5s)
⏰ Virtual time: 2025-10-04 00:00:00
🏠 20 homes initialized
💚 Ready to serve!
  `);
});

