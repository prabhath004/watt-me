"""
Core dispatch algorithm for single-home energy management
"""

import pandas as pd
from typing import Dict, Any
from neighborgrid.src.config import (
    BATTERY_MIN_SOC,
    BATTERY_MAX_SOC,
    BATTERY_EFFICIENCY,
    POLICY_SELF_FIRST,
)


def run_dispatch_single(
    timeseries: pd.DataFrame,
    battery_capacity_kwh: float,
    solar_capacity_kw: float,
    initial_soc: float = 0.5,
    pool_availability_kwh: list = None,
    policy_mode: str = POLICY_SELF_FIRST,
) -> pd.DataFrame:
    """
    Run hour-by-hour dispatch for a single home with battery and pool sharing.
    
    Dispatch logic (self_first mode):
    1. Solar covers load first
    2. Excess solar charges battery (within SOC limits)
    3. Remaining excess goes to community pool (earn credits)
    4. If solar insufficient, battery discharges to cover load
    5. If still insufficient, draw from pool (spend credits, if available)
    6. If still insufficient, import from grid
    
    Args:
        timeseries: DataFrame with columns [timestamp_hour, pv_production_kwh, load_consumption_kwh]
        battery_capacity_kwh: Battery capacity in kWh
        solar_capacity_kw: Solar capacity in kW (for metadata)
        initial_soc: Initial battery state of charge (0.0-1.0)
        pool_availability_kwh: List of available kWh from pool per hour (None = unlimited)
        policy_mode: Dispatch policy (currently only 'self_first' implemented)
    
    Returns:
        DataFrame with dispatch results for each hour
    """
    results = []
    soc = max(BATTERY_MIN_SOC, min(BATTERY_MAX_SOC, initial_soc))
    credits_balance = 0.0
    
    hours = len(timeseries)
    if pool_availability_kwh is None:
        pool_availability_kwh = [999999.0] * hours  # Effectively unlimited
    
    for idx, row in timeseries.iterrows():
        ts = row['timestamp_hour']
        pv = row['pv_production_kwh']
        load = row['load_consumption_kwh']
        pool_cap = pool_availability_kwh[idx]
        
        # Initialize hour results
        battery_flow = 0.0  # Positive = charging, negative = discharging
        to_pool = 0.0
        from_pool = 0.0
        grid_import = 0.0
        
        # Step 1: Solar covers load
        net = pv - load
        
        if net > 0:
            # Excess solar available
            # Step 2: Charge battery with excess
            max_charge = (BATTERY_MAX_SOC - soc) * battery_capacity_kwh / BATTERY_EFFICIENCY
            battery_charge = min(net, max_charge)
            battery_flow = battery_charge
            soc += (battery_charge * BATTERY_EFFICIENCY) / battery_capacity_kwh
            net -= battery_charge
            
            # Step 3: Send remaining excess to pool
            if net > 0:
                to_pool = net
                credits_balance += to_pool
        else:
            # Solar insufficient, need more energy
            deficit = -net
            
            # Step 4: Discharge battery to cover deficit
            max_discharge = (soc - BATTERY_MIN_SOC) * battery_capacity_kwh * BATTERY_EFFICIENCY
            battery_discharge = min(deficit, max_discharge)
            battery_flow = -battery_discharge
            soc -= battery_discharge / (battery_capacity_kwh * BATTERY_EFFICIENCY)
            deficit -= battery_discharge
            
            # Step 5: Draw from pool if still in deficit and have credits
            if deficit > 0:
                from_pool_max = min(deficit, pool_cap, credits_balance if credits_balance > 0 else 0)
                from_pool = from_pool_max
                credits_balance -= from_pool
                deficit -= from_pool
            
            # Step 6: Import from grid as last resort
            if deficit > 0:
                grid_import = deficit
        
        # Record hour results
        results.append({
            'timestamp_hour': ts,
            'home_id': 'H001',
            'solar_capacity_kw': solar_capacity_kw,
            'battery_capacity_kwh': battery_capacity_kwh,
            'pv_production_kwh': round(pv, 2),
            'load_consumption_kwh': round(load, 2),
            'from_pool_cap_kwh': round(pool_cap, 2),
            'battery_soc_pct': round(soc * 100, 1),
            'battery_flow_kwh': round(battery_flow, 3),
            'to_pool_kwh': round(to_pool, 3),
            'from_pool_kwh': round(from_pool, 3),
            'grid_import_kwh': round(grid_import, 3),
            'credits_delta_kwh': round((to_pool - from_pool), 3),
            'credits_balance_kwh': round(credits_balance, 3),
            'policy_mode': policy_mode,
        })
    
    return pd.DataFrame(results)


def compute_summary_stats(dispatch_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Compute summary statistics from dispatch results.
    
    Args:
        dispatch_df: DataFrame from run_dispatch_single
    
    Returns:
        Dictionary with summary statistics
    """
    total_pv = dispatch_df['pv_production_kwh'].sum()
    total_load = dispatch_df['load_consumption_kwh'].sum()
    total_to_pool = dispatch_df['to_pool_kwh'].sum()
    total_from_pool = dispatch_df['from_pool_kwh'].sum()
    total_grid = dispatch_df['grid_import_kwh'].sum()
    
    final_soc = dispatch_df.iloc[-1]['battery_soc_pct']
    final_credits = dispatch_df.iloc[-1]['credits_balance_kwh']
    
    return {
        'total_pv_kwh': round(total_pv, 1),
        'total_load_kwh': round(total_load, 1),
        'total_to_pool_kwh': round(total_to_pool, 1),
        'total_from_pool_kwh': round(total_from_pool, 1),
        'total_grid_import_kwh': round(total_grid, 1),
        'final_soc_pct': round(final_soc, 1),
        'final_credits_kwh': round(final_credits, 1),
    }

