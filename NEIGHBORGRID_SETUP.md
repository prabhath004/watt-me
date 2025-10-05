# 🚀 NeighborGrid Single-Home Setup & Run Guide

This guide walks you through setting up and running the NeighborGrid dispatch algorithm for a single home with solar and battery storage.

## ✅ Checklist Status

All steps have been completed and verified working!

## 1. Clone the Repo

```bash
git clone https://github.com/tejdeeppathipati/neighbor-grid-flow.git
cd neighbor-grid-flow
git checkout -b feature/dispatch-algo-mvp
git status
```

## 2. Verify File Structure

✅ **COMPLETED** - The following structure has been created:

```
neighborgrid/
  src/
    __init__.py          # Package initialization
    config.py            # Configuration constants
    simulator.py         # Synthetic data generation
    dispatch.py          # Core dispatch algorithm
    run_single.py        # CLI runner
    io_utils.py          # Input/output utilities
  tests/
    __init__.py
    test_synthetic_shapes.py      # Tests for data generation
    test_dispatch_invariants.py   # Tests for dispatch logic
requirements.txt         # Python dependencies
NEIGHBORGRID_SETUP.md    # This file
run_tests.sh             # Helper script to run tests
run_simulation.sh        # Helper script to run simulation
```

Check with:
```bash
ls -R neighborgrid
```

## 3. Create Virtual Environment & Install Dependencies

### Option A: Using venv (recommended)
```bash
python3 -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Option B: Global install
```bash
pip3 install pandas numpy pytest
```

## 4. Quick Import Test

✅ **PASSED** - Verify code imports without errors:

```bash
python3 - << 'PY'
from neighborgrid.src.simulator import make_single_home_timeseries
from neighborgrid.src.dispatch import run_dispatch_single
print("✅ OK: imports working")
PY
```

Expected output:
```
✅ OK: imports working
```

## 5. Run Tests

✅ **PASSED** - All 14 tests passing:

### Option A: Using helper script (recommended)
```bash
./run_tests.sh
```

### Option B: Manual pytest
```bash
PYTHONPATH=. pytest -v
```

Expected output:
```
============================== test session starts ==============================
...
neighborgrid/tests/test_dispatch_invariants.py::test_dispatch_basic_run PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_battery_soc_within_limits PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_energy_balance PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_no_simultaneous_pool_transactions PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_credits_accumulation PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_summary_stats PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_high_solar_scenario PASSED
neighborgrid/tests/test_dispatch_invariants.py::test_no_solar_scenario PASSED
neighborgrid/tests/test_synthetic_shapes.py::test_timeseries_basic_shape PASSED
neighborgrid/tests/test_synthetic_shapes.py::test_solar_zero_at_night PASSED
neighborgrid/tests/test_synthetic_shapes.py::test_solar_positive_daytime PASSED
neighborgrid/tests/test_synthetic_shapes.py::test_load_always_positive PASSED
neighborgrid/tests/test_synthetic_shapes.py::test_pool_availability_length PASSED
neighborgrid/tests/test_synthetic_shapes.py::test_different_solar_capacities PASSED
============================== 14 passed in 0.39s
```

## 6. Run Single-Home Algorithm

✅ **VERIFIED** - Algorithm runs successfully:

### Option A: Using helper script (recommended)
```bash
./run_simulation.sh --hours 24 --start 2025-10-04 --solar-kw 6 --battery-kwh 10 --out out_single.csv
```

### Option B: Manual run
```bash
PYTHONPATH=. python3 -m neighborgrid.src.run_single --hours 24 --start 2025-10-04 --solar-kw 6 --battery-kwh 10 --out out_single.csv
```

Expected console output:
```
NeighborGrid — Single Home (H001)
Hours: 24  |  Solar kW: 6.0  |  Battery kWh: 10.0
Totals — PV: 35.9  |  Load: 18.2  |  ToPool: 19.5  |  FromPool: 0.0  |  GridImport: 0.2
Final SOC: 25.8%  |  Final Credits: +19.5 kWh
Fair-rate ($0.18/kWh) — Earned: $3.51  |  Paid: $0.00  |  Net: +3.51
CSV written to: out_single.csv
```

### Available Options

```bash
./run_simulation.sh --help
```

Options:
- `--hours N` - Number of hours to simulate (default: 24)
- `--start YYYY-MM-DD` - Start date (default: 2025-10-04)
- `--solar-kw N` - Solar capacity in kW (default: 6.0)
- `--battery-kwh N` - Battery capacity in kWh (default: 10.0)
- `--initial-soc N` - Initial battery SOC 0-1 (default: 0.5)
- `--out FILE` - Output CSV filepath (default: out_single.csv)

## 7. Inspect Output File

✅ **VERIFIED** - CSV contains all required columns:

```bash
head -5 out_single.csv
```

Expected columns:
```csv
timestamp_hour,home_id,solar_capacity_kw,battery_capacity_kwh,
pv_production_kwh,load_consumption_kwh,from_pool_cap_kwh,
battery_soc_pct,battery_flow_kwh,to_pool_kwh,from_pool_kwh,
grid_import_kwh,credits_delta_kwh,credits_balance_kwh,policy_mode
```

Sample output:
```csv
timestamp_hour,home_id,solar_capacity_kw,battery_capacity_kwh,pv_production_kwh,load_consumption_kwh,from_pool_cap_kwh,battery_soc_pct,battery_flow_kwh,to_pool_kwh,from_pool_kwh,grid_import_kwh,credits_delta_kwh,credits_balance_kwh,policy_mode
2025-10-04 00:00:00,H001,6.0,10.0,0.0,0.27,999999.0,47.2,-0.268,0.0,0.0,0.0,0.0,0.0,self_first
2025-10-04 01:00:00,H001,6.0,10.0,0.0,0.27,999999.0,44.3,-0.275,0.0,0.0,0.0,0.0,0.0,self_first
```

## 🎯 Key Concepts

### Dispatch Algorithm (self_first mode)

The algorithm follows this priority order each hour:

1. **Solar → Load**: Solar production covers home load first
2. **Solar → Battery**: Excess solar charges battery (within SOC limits: 20-95%)
3. **Solar → Pool**: Remaining excess sent to community pool (earn credits)
4. **Battery → Load**: If solar insufficient, battery discharges (with efficiency losses)
5. **Pool → Load**: If still insufficient, draw from pool (spend credits)
6. **Grid → Load**: Last resort, import from grid

### Key Metrics

- **Credits Balance**: kWh credits earned (to pool) minus spent (from pool)
- **Battery SOC**: State of charge (20-95% operating range)
- **Fair Rate**: $0.18/kWh for pool transactions
- **Battery Efficiency**: 95% round-trip efficiency

## 🧪 Running Different Scenarios

### High Solar Scenario
```bash
./run_simulation.sh --hours 48 --solar-kw 15 --battery-kwh 15 --out high_solar.csv
```

### Small Battery Scenario
```bash
./run_simulation.sh --hours 48 --solar-kw 6 --battery-kwh 5 --out small_battery.csv
```

### Multi-day Simulation
```bash
./run_simulation.sh --hours 168 --start 2025-10-04 --solar-kw 8 --battery-kwh 13.5 --out week.csv
```

## 📊 Understanding the Output

### Console Summary

- **Totals**: Cumulative energy flows over the simulation period
- **Final SOC**: Battery state of charge at end of simulation
- **Final Credits**: Net kWh balance in the community pool
- **Fair-rate economics**: Dollar value of pool transactions

### CSV Columns Explained

- `timestamp_hour`: Hour timestamp
- `pv_production_kwh`: Solar production this hour
- `load_consumption_kwh`: Home load consumption this hour
- `battery_soc_pct`: Battery state of charge (%)
- `battery_flow_kwh`: Battery charge (+) or discharge (-)
- `to_pool_kwh`: Energy sent to community pool
- `from_pool_kwh`: Energy drawn from community pool
- `grid_import_kwh`: Energy imported from grid
- `credits_delta_kwh`: Net credits change this hour
- `credits_balance_kwh`: Cumulative credits balance

## 🔧 Troubleshooting

### Import Errors
If you see `ModuleNotFoundError: No module named 'neighborgrid'`:
- Use the helper scripts (`./run_tests.sh` or `./run_simulation.sh`)
- Or manually set `PYTHONPATH=.` before commands

### Missing Dependencies
```bash
pip3 install pandas numpy pytest
```

### Permission Denied on Scripts
```bash
chmod +x run_tests.sh run_simulation.sh
```

## 🚀 Next Steps

1. **Extend to multi-home**: Create `run_multi.py` for community-wide simulation
2. **Add visualization**: Plot energy flows, SOC, credits over time
3. **Real data integration**: Replace synthetic data with actual meter readings
4. **API integration**: Connect to the React frontend
5. **Optimization**: Implement predictive dispatch using forecasts

## 📝 Notes

- All times are hourly resolution
- Solar production uses synthetic bell curve (6am-6pm)
- Load consumption has realistic day/night patterns
- Battery efficiency is 95% round-trip
- SOC constraints prevent deep discharge (20% min) and overcharge (95% max)

---

**Status**: ✅ All systems operational - Ready for further development!

