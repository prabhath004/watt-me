"""
Test dispatch algorithm invariants and logic
"""

import pytest
import pandas as pd
from neighborgrid.src.simulator import make_single_home_timeseries
from neighborgrid.src.dispatch import run_dispatch_single, compute_summary_stats
from neighborgrid.src.config import BATTERY_MIN_SOC, BATTERY_MAX_SOC


def test_dispatch_basic_run():
    """Test that dispatch runs without errors"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=6.0,
        initial_soc=0.5,
    )
    
    assert len(result) == 24, "Should have 24 hours of results"
    assert 'battery_soc_pct' in result.columns
    assert 'credits_balance_kwh' in result.columns


def test_battery_soc_within_limits():
    """Test that battery SOC stays within configured limits"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=6.0,
        initial_soc=0.5,
    )
    
    min_soc = result['battery_soc_pct'].min()
    max_soc = result['battery_soc_pct'].max()
    
    assert min_soc >= BATTERY_MIN_SOC * 100, f"SOC {min_soc}% below minimum {BATTERY_MIN_SOC*100}%"
    assert max_soc <= BATTERY_MAX_SOC * 100, f"SOC {max_soc}% above maximum {BATTERY_MAX_SOC*100}%"


def test_energy_balance():
    """Test that energy is conserved (within battery efficiency)"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=6.0,
        initial_soc=0.5,
    )
    
    for idx, row in result.iterrows():
        pv = row['pv_production_kwh']
        load = row['load_consumption_kwh']
        batt_flow = row['battery_flow_kwh']  # positive = charging
        to_pool = row['to_pool_kwh']
        from_pool = row['from_pool_kwh']
        grid = row['grid_import_kwh']
        
        # Sources: PV + battery discharge + pool + grid
        # Sinks: Load + battery charge + to_pool
        sources = pv + (abs(batt_flow) if batt_flow < 0 else 0) + from_pool + grid
        sinks = load + (batt_flow if batt_flow > 0 else 0) + to_pool
        
        # Should balance within small tolerance (due to battery efficiency)
        diff = abs(sources - sinks)
        assert diff < 0.01, f"Hour {idx}: Energy imbalance {diff:.3f} kWh"


def test_no_simultaneous_pool_transactions():
    """Test that we don't send to AND receive from pool in same hour"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=6.0,
        initial_soc=0.5,
    )
    
    for idx, row in result.iterrows():
        to_pool = row['to_pool_kwh']
        from_pool = row['from_pool_kwh']
        
        # Should not have both in same hour
        if to_pool > 0:
            assert from_pool == 0, f"Hour {idx}: simultaneous pool send/receive"
        if from_pool > 0:
            assert to_pool == 0, f"Hour {idx}: simultaneous pool send/receive"


def test_credits_accumulation():
    """Test that credits accumulate correctly"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=6.0,
        initial_soc=0.5,
    )
    
    expected_credits = 0.0
    for idx, row in result.iterrows():
        expected_credits += row['credits_delta_kwh']
        actual_credits = row['credits_balance_kwh']
        
        assert abs(expected_credits - actual_credits) < 0.01, \
            f"Hour {idx}: credits mismatch {expected_credits:.2f} vs {actual_credits:.2f}"


def test_summary_stats():
    """Test that summary statistics are computed correctly"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=6.0,
        initial_soc=0.5,
    )
    
    stats = compute_summary_stats(result)
    
    assert 'total_pv_kwh' in stats
    assert 'total_load_kwh' in stats
    assert 'final_soc_pct' in stats
    assert 'final_credits_kwh' in stats
    
    # Verify totals match
    assert abs(stats['total_pv_kwh'] - result['pv_production_kwh'].sum()) < 0.1
    assert abs(stats['total_load_kwh'] - result['load_consumption_kwh'].sum()) < 0.1


def test_high_solar_scenario():
    """Test scenario with very high solar production"""
    timeseries = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=15.0,  # Very large solar
    )
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=15.0,
        initial_soc=0.2,
    )
    
    stats = compute_summary_stats(result)
    
    # With high solar, we should:
    # 1. Send excess to pool (positive credits)
    # 2. Minimize or eliminate grid import
    assert stats['total_to_pool_kwh'] > 0, "High solar should send to pool"
    assert stats['final_credits_kwh'] > 0, "Should accumulate credits"


def test_no_solar_scenario():
    """Test scenario with no solar (night only)"""
    # Create timeseries with zero solar
    timeseries = pd.DataFrame({
        'timestamp_hour': pd.date_range('2025-10-04', periods=24, freq='h'),
        'pv_production_kwh': [0.0] * 24,
        'load_consumption_kwh': [0.8] * 24,
    })
    
    result = run_dispatch_single(
        timeseries=timeseries,
        battery_capacity_kwh=10.0,
        solar_capacity_kw=0.0,
        initial_soc=0.5,
    )
    
    stats = compute_summary_stats(result)
    
    # With no solar:
    # 1. Should discharge battery first
    # 2. Eventually need grid import
    assert stats['total_pv_kwh'] == 0.0
    assert stats['total_grid_import_kwh'] > 0, "Should need grid import without solar"

