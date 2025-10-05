"""
Test synthetic timeseries generation
"""

import pytest
from neighborgrid.src.simulator import make_single_home_timeseries, make_pool_availability


def test_timeseries_basic_shape():
    """Test that timeseries has correct shape and columns"""
    df = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    assert len(df) == 24, "Should have 24 hours"
    assert 'timestamp_hour' in df.columns
    assert 'pv_production_kwh' in df.columns
    assert 'load_consumption_kwh' in df.columns


def test_solar_zero_at_night():
    """Test that solar production is zero during night hours"""
    df = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    # Check hours 0-5 (midnight to 5am) have zero solar
    for idx in range(6):
        assert df.iloc[idx]['pv_production_kwh'] == 0.0, f"Hour {idx} should have no solar"


def test_solar_positive_daytime():
    """Test that solar production is positive during daytime"""
    df = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    # Check hours 8-16 (morning to afternoon) have positive solar
    for idx in range(8, 17):
        assert df.iloc[idx]['pv_production_kwh'] > 0, f"Hour {idx} should have solar"


def test_load_always_positive():
    """Test that load consumption is always positive"""
    df = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=6.0,
    )
    
    assert (df['load_consumption_kwh'] > 0).all(), "Load should always be positive"


def test_pool_availability_length():
    """Test pool availability matches requested hours"""
    pool = make_pool_availability(hours=48, base_capacity_kwh=5.0)
    assert len(pool) == 48, "Pool availability should match hours"
    assert all(p > 0 for p in pool), "Pool capacity should be positive"


def test_different_solar_capacities():
    """Test that larger solar capacity produces more energy"""
    df_small = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=3.0,
    )
    
    df_large = make_single_home_timeseries(
        start_date="2025-10-04",
        hours=24,
        solar_kw=10.0,
    )
    
    # Total PV production should scale with capacity
    total_small = df_small['pv_production_kwh'].sum()
    total_large = df_large['pv_production_kwh'].sum()
    
    assert total_large > total_small, "Larger solar capacity should produce more"

