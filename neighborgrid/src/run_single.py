"""
Command-line runner for single-home dispatch simulation
"""

import argparse
from neighborgrid.src.simulator import make_single_home_timeseries
from neighborgrid.src.dispatch import run_dispatch_single, compute_summary_stats
from neighborgrid.src.io_utils import write_dispatch_csv
from neighborgrid.src.config import (
    DEFAULT_SOLAR_KW,
    DEFAULT_BATTERY_KWH,
    DEFAULT_HOURS,
    FAIR_RATE_PER_KWH,
)


def main():
    parser = argparse.ArgumentParser(
        description="NeighborGrid single-home dispatch simulation"
    )
    parser.add_argument(
        "--hours",
        type=int,
        default=DEFAULT_HOURS,
        help=f"Number of hours to simulate (default: {DEFAULT_HOURS})",
    )
    parser.add_argument(
        "--start",
        type=str,
        default="2025-10-04",
        help="Start date in YYYY-MM-DD format (default: 2025-10-04)",
    )
    parser.add_argument(
        "--solar-kw",
        type=float,
        default=DEFAULT_SOLAR_KW,
        help=f"Solar capacity in kW (default: {DEFAULT_SOLAR_KW})",
    )
    parser.add_argument(
        "--battery-kwh",
        type=float,
        default=DEFAULT_BATTERY_KWH,
        help=f"Battery capacity in kWh (default: {DEFAULT_BATTERY_KWH})",
    )
    parser.add_argument(
        "--out",
        type=str,
        default="out_single.csv",
        help="Output CSV filepath (default: out_single.csv)",
    )
    parser.add_argument(
        "--initial-soc",
        type=float,
        default=0.5,
        help="Initial battery SOC as fraction 0-1 (default: 0.5)",
    )
    
    args = parser.parse_args()
    
    # Print header
    print(f"\nNeighborGrid — Single Home (H001)")
    print(f"Hours: {args.hours}  |  Solar kW: {args.solar_kw}  |  Battery kWh: {args.battery_kwh}")
    
    # Generate timeseries
    timeseries = make_single_home_timeseries(
        start_date=args.start,
        hours=args.hours,
        solar_kw=args.solar_kw,
    )
    
    # Run dispatch
    dispatch_df = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=args.battery_kwh,
        solar_capacity_kw=args.solar_kw,
        initial_soc=args.initial_soc,
    )
    
    # Compute summary
    stats = compute_summary_stats(dispatch_df)
    
    # Calculate fair-rate economics
    earned = stats['total_to_pool_kwh'] * FAIR_RATE_PER_KWH
    paid = stats['total_from_pool_kwh'] * FAIR_RATE_PER_KWH
    net = earned - paid
    
    # Print summary
    print(
        f"Totals — PV: {stats['total_pv_kwh']}  |  "
        f"Load: {stats['total_load_kwh']}  |  "
        f"ToPool: {stats['total_to_pool_kwh']}  |  "
        f"FromPool: {stats['total_from_pool_kwh']}  |  "
        f"GridImport: {stats['total_grid_import_kwh']}"
    )
    print(
        f"Final SOC: {stats['final_soc_pct']}%  |  "
        f"Final Credits: {stats['final_credits_kwh']:+.1f} kWh"
    )
    print(
        f"Fair-rate (${FAIR_RATE_PER_KWH}/kWh) — "
        f"Earned: ${earned:.2f}  |  "
        f"Paid: ${paid:.2f}  |  "
        f"Net: {net:+.2f}"
    )
    
    # Write output
    write_dispatch_csv(dispatch_df, args.out)
    print()


if __name__ == "__main__":
    main()

