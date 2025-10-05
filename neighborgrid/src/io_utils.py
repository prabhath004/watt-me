"""
Input/output utilities for NeighborGrid
"""

import pandas as pd


def write_dispatch_csv(df: pd.DataFrame, filepath: str) -> None:
    """
    Write dispatch results to CSV file.
    
    Args:
        df: DataFrame with dispatch results
        filepath: Output file path
    """
    df.to_csv(filepath, index=False)
    print(f"CSV written to: {filepath}")


def read_dispatch_csv(filepath: str) -> pd.DataFrame:
    """
    Read dispatch results from CSV file.
    
    Args:
        filepath: Input file path
    
    Returns:
        DataFrame with dispatch results
    """
    df = pd.read_csv(filepath)
    df['timestamp_hour'] = pd.to_datetime(df['timestamp_hour'])
    return df

