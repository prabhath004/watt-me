"""
Configuration constants for NeighborGrid dispatch algorithm
"""

# Battery parameters
BATTERY_MIN_SOC = 0.20  # 20% minimum state of charge
BATTERY_MAX_SOC = 0.95  # 95% maximum state of charge
BATTERY_EFFICIENCY = 0.95  # Round-trip efficiency

# Pool sharing parameters
FAIR_RATE_PER_KWH = 0.18  # $0.18/kWh for credit transactions

# Policy modes
POLICY_SELF_FIRST = "self_first"
POLICY_COMMUNITY_FIRST = "community_first"

# Default simulation parameters
DEFAULT_SOLAR_KW = 6.0
DEFAULT_BATTERY_KWH = 10.0
DEFAULT_HOURS = 24

