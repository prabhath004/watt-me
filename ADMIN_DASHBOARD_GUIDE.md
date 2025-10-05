# 📊 Admin Dashboard Integration Guide

Complete guide for the NeighborGrid Community Admin Dashboard - visualizing multi-home energy sharing, routing, and analytics.

---

## 🎯 What's Built

A complete admin dashboard that displays:

1. **Community KPI Cards** - Production, Microgrid Shared, Grid Import
2. **Hour-by-Hour Routing** - Producer-to-consumer energy flow pairings
3. **Hourly Trend Charts** - Time-series visualization of energy flows
4. **Home Snapshots** - Final battery SOC and credit balances per home

---

## 📁 Architecture Overview

### Data Flow

```
Python Algorithm → CSV Files → Frontend Loader → React Context → UI Components
```

1. **Backend (Python)**:
   - `neighborgrid/src/run_multi.py` - Generates 10-home community simulation
   - Outputs: `public/data/community_timeseries.csv` (1200 rows) + `community_metadata.csv` (10 rows)

2. **Frontend (React/TypeScript)**:
   - `src/lib/communityData.ts` - Data loading, parsing, aggregations
   - `src/contexts/AdminDataContext.tsx` - State management
   - `src/pages/AdminCommunity.tsx` - Main dashboard page
   - `src/components/admin/*` - Reusable UI components

---

## 🗂️ File Structure

### Python Backend

```
neighborgrid/
├── src/
│   ├── run_multi.py         # Multi-home simulation (NEW)
│   ├── simulator.py         # Enhanced with orientation/load shifts (UPDATED)
│   ├── dispatch.py          # Single-home dispatch
│   ├── config.py
│   ├── io_utils.py
│   └── run_single.py
└── tests/
    ├── test_synthetic_shapes.py
    └── test_dispatch_invariants.py
```

### Frontend TypeScript

```
src/
├── types/
│   └── community.ts              # Type definitions (NEW)
├── lib/
│   └── communityData.ts          # Data utilities (NEW)
├── contexts/
│   └── AdminDataContext.tsx      # State management (NEW)
├── components/admin/
│   ├── CommunityKPIs.tsx         # KPI cards (NEW)
│   ├── HourSelector.tsx          # Hour picker (NEW)
│   ├── RoutingTable.tsx          # Energy routing (NEW)
│   ├── CommunityTrendChart.tsx   # Trend chart (NEW)
│   └── HomeSnapshotTable.tsx     # Home snapshots (NEW)
└── pages/
    ├── AdminCommunity.tsx        # Main dashboard (NEW)
    └── Admin.tsx                 # Landing page (UPDATED)
```

---

## 🚀 Quick Start

### 1. Generate Community Data

```bash
# Generate 5 days of data for 10 homes
./run_generate_community_data.sh --days 5 --start 2025-10-01

# Custom parameters
./run_generate_community_data.sh --days 7 --start 2025-10-15
```

**Output:**
- `public/data/community_timeseries.csv` - 1200 rows (10 homes × 5 days × 24 hours)
- `public/data/community_metadata.csv` - 10 rows (one per home)

### 2. Start Development Server

```bash
npm install  # If first time
npm run dev
```

### 3. View Dashboard

1. Open: http://localhost:8080
2. Login as admin (use mock credentials from your auth system)
3. Navigate: **Admin → Community Dashboard**

---

## 📊 Dashboard Features

### 1. Community KPI Cards

Three key metrics at the top:

- **Total Production**: Σ of all solar PV production
- **Microgrid Shared**: Σ of `from_pool_kwh` (energy delivered locally)
- **Grid Import**: Σ of `grid_import_kwh` (external utility usage)

**UX Notes:**
- Color-coded icons (yellow/green/blue)
- Clean, minimal design
- Updates when data changes

### 2. Hour Selector

Interactive control to choose which hour to inspect:

- **Slider**: Quick scrubbing through hours
- **Dropdown**: Precise hour selection
- **Display**: Shows selected date + time clearly

**UX Notes:**
- Defaults to first hour with microgrid activity
- Shows "Hour X of Y" for context
- Updates routing table in real-time

### 3. Routing Table

Inferred producer-to-consumer energy pairings:

| From (Producer) | → | To (Consumer) | Energy (kWh) |
|-----------------|---|---------------|--------------|
| H001            | → | H003          | 0.140        |
| H001            | → | H009          | 0.180        |

**Algorithm:**
- Greedy allocation (largest producer → largest consumer first)
- Display-only inference (doesn't modify data)
- Shows "No local routing" if no activity

**UX Notes:**
- Arrow icons for flow direction
- Monospace fonts for home IDs
- Total routed kWh shown at bottom

### 4. Community Trend Chart

Time-series line chart showing:

- **Production** (yellow) - Total solar PV over time
- **Microgrid** (green) - Locally shared energy
- **Grid Import** (blue) - External grid usage

**Features:**
- Day/night cycles clearly visible
- Interactive tooltips
- Responsive design

### 5. Home Snapshot Table

Final state for each home:

| Home | Solar (kW) | Battery (kWh) | SOC  | Credits (kWh) | Net Period (kWh) |
|------|------------|---------------|------|---------------|------------------|
| H001 | 8.0        | 13.5          | 46%  | +19.52        | +19.52           |
| H002 | 6.5        | 10.0          | 38%  | +12.34        | +12.34           |

**Features:**
- Visual SOC progress bars (green/yellow/red)
- Credit badges (green for positive, red for negative)
- Net period with trend indicators
- Sorted by credits (highest first)

---

## 🔍 Data Model

### Timeseries Row (1200 rows)

```typescript
{
  timestamp_hour: "2025-10-01 09:00:00",
  home_id: "H001",
  solar_capacity_kw: 8.0,
  battery_capacity_kwh: 13.5,
  pv_production_kwh: 7.2,
  load_consumption_kwh: 0.6,
  battery_soc_pct: 85.3,
  battery_flow_kwh: 0.5,      // + = charging, - = discharging
  to_pool_kwh: 6.1,            // Sent to community
  from_pool_kwh: 0.0,          // Received from community
  grid_import_kwh: 0.0,
  credits_delta_kwh: 6.1,      // to_pool - from_pool
  credits_balance_kwh: 45.2,   // Cumulative balance
  policy_mode: "self_first"
}
```

### Home Metadata (10 rows)

```typescript
{
  home_id: "H001",
  solar_capacity_kw: 8.0,
  battery_capacity_kwh: 13.5,
  load_base_kwh: 0.6,
  load_peak_kwh: 1.2,
  solar_orientation: "east",        // east/south/west
  load_pattern_shift_hours: 0,      // 0-3 hours
  is_net_consumer: false
}
```

---

## 🧮 Aggregation Functions

### Community Totals

```typescript
{
  production_kwh: Σ pv_production_kwh,
  microgrid_used_kwh: Σ from_pool_kwh,
  grid_import_kwh: Σ grid_import_kwh,
  self_consumption_kwh: Σ min(PV, Load)  // Per-home direct use
}
```

### Hourly Trends

For each hour:
```typescript
{
  timestamp_hour: "2025-10-01 09:00:00",
  production_kwh: Σ PV (all homes),
  microgrid_used_kwh: Σ from_pool (all homes),
  grid_import_kwh: Σ grid_import (all homes),
  self_consumption_ratio: Σ min(PV,Load) / Σ PV
}
```

### Routing Pairs (per hour)

Greedy allocation algorithm:
1. Sort producers by `to_pool_kwh` DESC
2. Sort consumers by `from_pool_kwh` DESC
3. Allocate from largest producer to largest consumer
4. Continue until all energy allocated

Result: `{ from_home, to_home, kwh }`

---

## 🎨 UI/UX Design Principles

### 1. Loading States
- Skeleton loaders while fetching data
- "Loading data..." message
- No jarring content shifts

### 2. Error Handling
- Clear error messages
- Instructions for fixing (e.g., "Make sure CSV files exist")
- Graceful degradation

### 3. Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Tables scroll horizontally on small screens

### 4. Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

### 5. Performance
- Data parsed once on load
- Memoized computations
- Hour selection uses indices (fast)

---

## 🔧 Configuration & Customization

### Change Community Size

Edit `neighborgrid/src/run_multi.py`:

```python
COMMUNITY_HOMES = [
    # Add more homes...
    ("H011", 7.0, 11.0, 0.6, 1.2, 0, 0, False),
]
```

### Change Simulation Period

```bash
./run_generate_community_data.sh --days 30
```

### Add New KPI Card

1. Update `CommunityTotals` type in `src/types/community.ts`
2. Update `computeCommunityTotals()` in `src/lib/communityData.ts`
3. Add new card to `CommunityKPIs.tsx`

### Add New Chart

1. Create component in `src/components/admin/`
2. Import data from `useAdminData()` hook
3. Use Recharts for consistent styling

---

## ✅ Validation Checks

### Data Sanity

Run these checks manually or create tests:

```typescript
// Row count: 10 homes × 5 days × 24 hours = 1200
assert(timeseries.length === 1200);

// Unique homes: exactly 10
const homeIds = new Set(timeseries.map(r => r.home_id));
assert(homeIds.size === 10);

// Unique hours: exactly 120
const hours = new Set(timeseries.map(r => r.timestamp_hour));
assert(hours.size === 120);

// No NaNs in numeric fields
assert(timeseries.every(r => !isNaN(r.pv_production_kwh)));

// Non-negativity
assert(timeseries.every(r => r.to_pool_kwh >= 0));
assert(timeseries.every(r => r.from_pool_kwh >= 0));

// Credits consistency (per home)
for (const homeId of homeIds) {
  const homeRows = timeseries.filter(r => r.home_id === homeId);
  const sumDeltas = homeRows.reduce((s, r) => s + r.credits_delta_kwh, 0);
  const finalBalance = homeRows[homeRows.length - 1].credits_balance_kwh;
  assert(Math.abs(sumDeltas - finalBalance) < 0.01);
}
```

---

## 🐛 Troubleshooting

### "Failed to fetch community data"

**Cause:** CSV files don't exist or are in wrong location

**Fix:**
```bash
# Regenerate data
./run_generate_community_data.sh --days 5

# Check files exist
ls -l public/data/community_*.csv
```

### "No local routing at this hour"

**Cause:** All homes are either producing or consuming simultaneously

**Fix:** This is normal behavior when:
- Night time: all homes consuming, none producing
- Midday: all homes producing excess, batteries full

Try selecting morning/evening hours (7-10 AM, 5-7 PM) for more routing activity.

### TypeScript Errors

**Cause:** Missing dependencies or incorrect imports

**Fix:**
```bash
npm install
npm run dev
```

### Chart Not Rendering

**Cause:** Missing Recharts library

**Fix:**
```bash
npm install recharts
```

---

## 🚀 Next Steps / Extensions

### 1. Day Filter

Add a quick filter to view single day:

```typescript
const [selectedDay, setSelectedDay] = useState<number>(1);
const dayFilteredData = timeseries.filter(row => 
  row.timestamp_hour.startsWith(`2025-10-0${selectedDay}`)
);
```

### 2. Savings Card

Calculate cost savings from local sharing:

```typescript
const avoided_cost = microgrid_used_kwh * (utility_rate - fair_rate);
// e.g., 50 kWh * ($0.35 - $0.18) = $8.50 saved
```

### 3. CO₂ Avoidance

Show environmental impact:

```typescript
const avoided_emissions = grid_import_kwh * emission_factor;
// e.g., 200 kWh * 0.5 kg CO₂/kWh = 100 kg CO₂ avoided
```

### 4. Blackout Drill

Simulate `grid_import = 0`:

```typescript
const autonomy_hours = timeseries.filter(row => 
  row.grid_import_kwh === 0
).length / 10; // Divide by number of homes
```

### 5. Live Data Integration

Replace CSV loading with API calls:

```typescript
const response = await fetch('/api/community/timeseries');
const data = await response.json();
```

### 6. Export Reports

Add CSV/PDF export:

```typescript
import { CSVLink } from 'react-csv';

<CSVLink data={snapshots} filename="community_report.csv">
  Export Report
</CSVLink>
```

---

## 📚 Key Concepts Summary

### Dispatch Algorithm (self_first mode)

1. Solar → Load (self-consumption first)
2. Solar → Battery (charge up to 95% SOC)
3. Solar → Pool (excess goes to community)
4. Battery → Load (discharge down to 20% SOC)
5. Pool → Load (if credits available)
6. Grid → Load (last resort)

### Community Pool Matching

- Hour-by-hour matching of producers and consumers
- Greedy allocation (largest first)
- Enforces conservation of energy
- Fair-rate credits ($0.18/kWh)

### Solar Orientation Effects

- **East-facing**: Peak production 8-10 AM
- **South-facing**: Peak production 11 AM - 1 PM  
- **West-facing**: Peak production 2-4 PM

Creates natural producer/consumer mismatches → enables sharing!

### Load Pattern Shifts

- Some homes peak early (6-9 AM)
- Some homes peak late (8-11 PM)
- Different schedules create demand diversity

---

## 📖 Reference

### CSV Column Definitions

| Column                  | Type   | Description                        |
|-------------------------|--------|------------------------------------|
| `timestamp_hour`        | string | ISO timestamp (YYYY-MM-DD HH:MM)   |
| `home_id`               | string | Unique home identifier (H001-H010) |
| `solar_capacity_kw`     | number | Nameplate solar capacity           |
| `battery_capacity_kwh`  | number | Total battery capacity             |
| `pv_production_kwh`     | number | Solar production this hour         |
| `load_consumption_kwh`  | number | Home load this hour                |
| `battery_soc_pct`       | number | State of charge (0-100%)           |
| `battery_flow_kwh`      | number | +charge / -discharge               |
| `to_pool_kwh`           | number | Energy sent to community           |
| `from_pool_kwh`         | number | Energy received from community     |
| `grid_import_kwh`       | number | Energy from utility grid           |
| `credits_delta_kwh`     | number | Net credits this hour              |
| `credits_balance_kwh`   | number | Cumulative credit balance          |
| `policy_mode`           | string | Dispatch policy used               |

---

## ✨ Success Criteria

The dashboard is "done" when:

✅ KPI cards show believable totals  
✅ Hour selector updates routing table correctly  
✅ Trend chart shows clear day/night cycles  
✅ Home snapshot table displays all homes  
✅ Routing table shows producer/consumer pairs  
✅ Data updates automatically on file change  
✅ Loading and error states work properly  
✅ Mobile responsive design  
✅ No console errors or warnings  

---

## 🎉 You're All Set!

The admin dashboard is fully functional. Key achievements:

- ✅ Multi-home simulation with realistic diversity
- ✅ Complete frontend data pipeline
- ✅ Professional UI components
- ✅ Interactive visualizations
- ✅ Clean architecture ready for extension

**Next:** Start experimenting with different community configurations, add your own features, or integrate with live data sources!

---

**Questions?** Check the inline code comments or review the source files for detailed documentation.

