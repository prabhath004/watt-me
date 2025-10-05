"""
Synthetic timeseries generation for solar PV and home load consumption
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def make_single_home_timeseries(
    start_date: str,
    hours: int,
    solar_kw: float,
    load_base_kwh: float = 0.6,
    load_peak_kwh: float = 1.2,
    solar_orientation_offset: int = 0,
    load_pattern_shift: int = 0,
) -> pd.DataFrame:
    """
    Generate synthetic hourly timeseries for a single home.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        hours: Number of hours to simulate
        solar_kw: Solar panel capacity in kW (nameplate)
        load_base_kwh: Base load consumption per hour (kWh)
        load_peak_kwh: Peak load consumption per hour (kWh)
        solar_orientation_offset: Hour offset for solar peak (-2=east, 0=south, +2=west)
        load_pattern_shift: Hour offset for load pattern (0=normal, +2=late schedule)
    
    Returns:
        DataFrame with columns: timestamp_hour, pv_production_kwh, load_consumption_kwh
    """
    start = datetime.fromisoformat(start_date)
    timestamps = [start + timedelta(hours=h) for h in range(hours)]
    
    pv_production = []
    load_consumption = []
    
    for ts in timestamps:
        hour_of_day = ts.hour
        
        # Solar production: bell curve peaking at noon (with orientation offset)
        # Production only between 6 AM and 6 PM
        solar_peak_hour = 12 + solar_orientation_offset  # Shift peak based on orientation
        if 6 <= hour_of_day <= 18:
            # Normalize hour to 0-1 range (0 = 6am, 1 = 6pm)
            t = (hour_of_day - 6) / 12.0
            # Bell curve: peak adjusted by orientation
            peak_t = (solar_peak_hour - 6) / 12.0
            solar_factor = np.exp(-((t - peak_t) ** 2) / 0.08)
            pv = solar_kw * solar_factor
        else:
            pv = 0.0
        
        # Load consumption: higher in morning/evening, lower at night (with pattern shift)
        shifted_hour = (hour_of_day - load_pattern_shift) % 24
        if 6 <= shifted_hour <= 9 or 17 <= shifted_hour <= 22:
            # Peak usage times
            load = load_peak_kwh + np.random.uniform(-0.1, 0.1)
        elif 0 <= shifted_hour <= 5 or 23 <= shifted_hour <= 23:
            # Night time - lower usage
            load = load_base_kwh * 0.5 + np.random.uniform(-0.05, 0.05)
        else:
            # Daytime - moderate usage
            load = load_base_kwh + np.random.uniform(-0.1, 0.1)
        
        pv_production.append(max(0.0, pv))
        load_consumption.append(max(0.1, load))
    
    df = pd.DataFrame({
        'timestamp_hour': timestamps,
        'pv_production_kwh': pv_production,
        'load_consumption_kwh': load_consumption
    })
    
    return df


def make_pool_availability(hours: int, base_capacity_kwh: float = 5.0) -> list:
    """
    Generate synthetic pool availability for each hour.
    
    Args:
        hours: Number of hours
        base_capacity_kwh: Base pool capacity per hour
    
    Returns:
        List of available kWh from community pool for each hour
    """
    return [base_capacity_kwh + np.random.uniform(-1.0, 2.0) for _ in range(hours)]

