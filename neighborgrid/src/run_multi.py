"""
Command-line runner for multi-home community dispatch simulation
"""

import argparse
import pandas as pd
from datetime import datetime, timedelta
from neighborgrid.src.simulator import make_single_home_timeseries
from neighborgrid.src.dispatch import run_dispatch_single
from neighborgrid.src.config import DEFAULT_HOURS, FAIR_RATE_PER_KWH


# Community configuration: 10 homes with varied setups
# home_id, solar_kw, battery_kwh, load_base, load_peak, solar_offset, load_shift, is_net_consumer
COMMUNITY_HOMES = [
    ("H001", 8.0, 13.5, 0.6, 1.2, -2, 0, False),   # Large producer, east-facing
    ("H002", 6.5, 10.0, 0.7, 1.3, 0, 0, False),    # Medium producer, south
    ("H003", 7.5, 12.0, 0.5, 1.0, 2, 0, False),    # Medium producer, west-facing
    ("H004", 5.0, 8.0, 0.8, 1.5, 0, 2, True),      # Small producer, late schedule
    ("H005", 6.0, 10.0, 0.6, 1.2, -1, 0, False),   # Balanced, east-south
    ("H006", 4.5, 7.0, 0.9, 1.6, 0, 3, True),      # Net consumer, very late schedule
    ("H007", 5.5, 9.0, 0.7, 1.4, 1, 1, True),      # Net consumer, west-south, late
    ("H008", 7.0, 11.0, 0.5, 1.1, 0, 0, False),    # Medium producer, south
    ("H009", 3.5, 5.0, 1.0, 1.8, 0, 2, True),      # Small producer, high consumption, late
    ("H010", 6.5, 10.5, 0.6, 1.3, 2, 0, False),    # Medium producer, west-facing
]


def simulate_community_pool(all_home_results: list, start_date: str, hours: int) -> pd.DataFrame:
    """
    Simulate community pool sharing across multiple homes.
    Recomputes from_pool_kwh and to_pool_kwh based on community-wide matching.
    
    Args:
        all_home_results: List of DataFrames from individual home dispatch
        start_date: Start date string
        hours: Number of hours
        
    Returns:
        Combined DataFrame with community pool adjustments
    """
    # Combine all homes
    combined = pd.concat(all_home_results, ignore_index=True)
    combined = combined.sort_values(['timestamp_hour', 'home_id']).reset_index(drop=True)
    
    # Process hour by hour
    updated_rows = []
    
    for hour_idx in range(hours):
        hour_rows = combined[combined.index // 10 == hour_idx].copy()
        
        # Calculate net position for each home (positive = surplus, negative = deficit)
        # Net = PV production - Load consumption
        # Battery flow is already factored into the original to_pool/from_pool
        # We need to recalculate based on actual PV vs Load
        for idx, row in hour_rows.iterrows():
            pv = row['pv_production_kwh']
            load = row['load_consumption_kwh']
            battery_flow = row['battery_flow_kwh']
            
            # After satisfying own load and charging/discharging battery
            # Positive battery_flow = charging (using excess PV)
            # Negative battery_flow = discharging (supplementing load)
            if pv > load:
                # Surplus: excess after load goes to battery, then pool
                excess = pv - load
                battery_charge = max(0, battery_flow)  # Only count charging
                surplus_to_pool = excess - battery_charge
                hour_rows.at[idx, 'net_available'] = surplus_to_pool
            else:
                # Deficit: need more than PV provides
                deficit = load - pv
                battery_discharge = max(0, -battery_flow)  # Only count discharging
                remaining_deficit = deficit - battery_discharge
                hour_rows.at[idx, 'net_available'] = -remaining_deficit
        
        # Separate into producers (surplus) and consumers (deficit)
        producers = hour_rows[hour_rows['net_available'] > 0.01].copy()
        consumers = hour_rows[hour_rows['net_available'] < -0.01].copy()
        
        # Reset pool flows
        hour_rows['to_pool_kwh'] = 0.0
        hour_rows['from_pool_kwh'] = 0.0
        
        # Match producers to consumers (greedy allocation)
        if len(producers) > 0 and len(consumers) > 0:
            producers = producers.sort_values('net_available', ascending=False)
            consumers = consumers.sort_values('net_available', ascending=True)
            
            producer_idx = 0
            consumer_idx = 0
            producer_remaining = producers.iloc[producer_idx]['net_available']
            consumer_needed = -consumers.iloc[consumer_idx]['net_available']
            
            while producer_idx < len(producers) and consumer_idx < len(consumers):
                # Allocate energy
                allocated = min(producer_remaining, consumer_needed)
                
                # Update to_pool for producer
                p_home = producers.iloc[producer_idx]['home_id']
                hour_rows.loc[hour_rows['home_id'] == p_home, 'to_pool_kwh'] += allocated
                
                # Update from_pool for consumer
                c_home = consumers.iloc[consumer_idx]['home_id']
                hour_rows.loc[hour_rows['home_id'] == c_home, 'from_pool_kwh'] += allocated
                
                # Update remaining amounts
                producer_remaining -= allocated
                consumer_needed -= allocated
                
                # Move to next producer or consumer
                if producer_remaining < 0.001:
                    producer_idx += 1
                    if producer_idx < len(producers):
                        producer_remaining = producers.iloc[producer_idx]['net_available']
                
                if consumer_needed < 0.001:
                    consumer_idx += 1
                    if consumer_idx < len(consumers):
                        consumer_needed = -consumers.iloc[consumer_idx]['net_available']
        
        # Unmatched surplus goes to grid export (or storage)
        # Unmatched deficit becomes grid import
        for idx, row in hour_rows.iterrows():
            net = row['net_available']
            to_pool = row['to_pool_kwh']
            from_pool = row['from_pool_kwh']
            
            if net > 0:
                # Producer: leftover after pool goes to grid export (we'll ignore for now)
                pass
            elif net < 0:
                # Consumer: unmet need comes from grid
                unmet = -net - from_pool
                if unmet > 0.01:
                    hour_rows.at[idx, 'grid_import_kwh'] = unmet
                else:
                    hour_rows.at[idx, 'grid_import_kwh'] = 0.0
            else:
                hour_rows.at[idx, 'grid_import_kwh'] = 0.0
        
        # Update credits
        for idx, row in hour_rows.iterrows():
            hour_rows.at[idx, 'credits_delta_kwh'] = row['to_pool_kwh'] - row['from_pool_kwh']
        
        updated_rows.append(hour_rows.drop(columns=['net_available']))
    
    result = pd.concat(updated_rows, ignore_index=True)
    
    # Recalculate cumulative credits per home
    for home_id in result['home_id'].unique():
        home_mask = result['home_id'] == home_id
        result.loc[home_mask, 'credits_balance_kwh'] = result.loc[home_mask, 'credits_delta_kwh'].cumsum()
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="NeighborGrid multi-home community dispatch simulation"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=5,
        help="Number of days to simulate (default: 5)",
    )
    parser.add_argument(
        "--start",
        type=str,
        default="2025-10-01",
        help="Start date in YYYY-MM-DD format (default: 2025-10-01)",
    )
    parser.add_argument(
        "--out-timeseries",
        type=str,
        default="public/data/community_timeseries.csv",
        help="Output CSV for timeseries (default: public/data/community_timeseries.csv)",
    )
    parser.add_argument(
        "--out-metadata",
        type=str,
        default="public/data/community_metadata.csv",
        help="Output CSV for home metadata (default: public/data/community_metadata.csv)",
    )
    
    args = parser.parse_args()
    hours = args.days * 24
    
    print(f"\n🏘️  NeighborGrid — Community Simulation")
    print(f"Homes: {len(COMMUNITY_HOMES)}  |  Days: {args.days}  |  Hours: {hours}")
    print(f"=" * 60)
    
    # Generate individual home dispatches
    all_results = []
    metadata_rows = []
    
    for home_id, solar_kw, battery_kwh, load_base, load_peak, solar_offset, load_shift, is_net_consumer in COMMUNITY_HOMES:
        orientation = ["east", "east-south", "south", "south-west", "west"][solar_offset + 2]
        print(f"Simulating {home_id}... (Solar: {solar_kw}kW {orientation}, Battery: {battery_kwh}kWh)")
        
        # Generate timeseries
        timeseries = make_single_home_timeseries(
            start_date=args.start,
            hours=hours,
            solar_kw=solar_kw,
            load_base_kwh=load_base,
            load_peak_kwh=load_peak,
            solar_orientation_offset=solar_offset,
            load_pattern_shift=load_shift,
        )
        
        # Run individual dispatch (no community pool yet)
        result = run_dispatch_single(
            timeseries=timeseries,
            battery_capacity_kwh=battery_kwh,
            solar_capacity_kw=solar_kw,
            initial_soc=0.5,
            pool_availability_kwh=[0] * hours,  # No pool initially
        )
        
        # Update home_id
        result['home_id'] = home_id
        all_results.append(result)
        
        # Collect metadata
        orientation = ["east", "east-south", "south", "south-west", "west"][solar_offset + 2]
        metadata_rows.append({
            'home_id': home_id,
            'solar_capacity_kw': solar_kw,
            'battery_capacity_kwh': battery_kwh,
            'load_base_kwh': load_base,
            'load_peak_kwh': load_peak,
            'solar_orientation': orientation,
            'load_pattern_shift_hours': load_shift,
            'is_net_consumer': is_net_consumer,
        })
    
    print(f"\n{'Applying community pool sharing...'}")
    
    # Simulate community pool
    community_result = simulate_community_pool(all_results, args.start, hours)
    
    # Compute summary statistics
    total_pv = community_result['pv_production_kwh'].sum()
    total_load = community_result['load_consumption_kwh'].sum()
    total_pool_shared = community_result['from_pool_kwh'].sum()
    total_grid = community_result['grid_import_kwh'].sum()
    
    # Compute self-consumption (PV used directly without going through battery or pool)
    self_consumption_total = 0
    for home_id in community_result['home_id'].unique():
        home_data = community_result[community_result['home_id'] == home_id]
        for idx, row in home_data.iterrows():
            direct_use = min(row['pv_production_kwh'], row['load_consumption_kwh'])
            self_consumption_total += direct_use
    
    print(f"\n{'Community Summary:'}")
    print(f"  Total PV Production:     {total_pv:>8.1f} kWh")
    print(f"  Total Load Consumption:  {total_load:>8.1f} kWh")
    print(f"  Microgrid Shared:        {total_pool_shared:>8.1f} kWh ({total_pool_shared/total_load*100:.1f}% of load)")
    print(f"  Grid Import:             {total_grid:>8.1f} kWh ({total_grid/total_load*100:.1f}% of load)")
    print(f"  Self-Consumption:        {self_consumption_total:>8.1f} kWh")
    
    # Calculate fair-rate economics
    total_earnings = community_result['to_pool_kwh'].sum() * FAIR_RATE_PER_KWH
    total_payments = community_result['from_pool_kwh'].sum() * FAIR_RATE_PER_KWH
    print(f"\n{'Fair-Rate Economics ($0.18/kWh):'}")
    print(f"  Total Pool Earnings:  ${total_earnings:>8.2f}")
    print(f"  Total Pool Payments:  ${total_payments:>8.2f}")
    print(f"  (Should balance):     ${total_earnings - total_payments:>8.2f}")
    
    # Write outputs
    print(f"\n{'Writing outputs...'}")
    community_result.to_csv(args.out_timeseries, index=False)
    print(f"  ✅ Timeseries: {args.out_timeseries}")
    
    metadata_df = pd.DataFrame(metadata_rows)
    metadata_df.to_csv(args.out_metadata, index=False)
    print(f"  ✅ Metadata:   {args.out_metadata}")
    
    print(f"\n{'✨ Community simulation complete!'}\n")


if __name__ == "__main__":
    main()

