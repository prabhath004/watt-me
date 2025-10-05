/**
 * Admin Data Context - manages community energy data state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type {
  CommunityData,
  CommunityTotals,
  HourlyTrend,
  HomeSnapshot,
  RoutingPair,
} from "@/types/community";
import {
  loadCommunityData,
  computeCommunityTotals,
  computeHourlyTrends,
  computeHomeSnapshots,
  computeRoutingPairs,
  findDefaultHourIndex,
} from "@/lib/communityData";

interface AdminDataContextType {
  // Raw data
  data: CommunityData | null;
  
  // Aggregated data
  totals: CommunityTotals | null;
  trends: HourlyTrend[];
  snapshots: HomeSnapshot[];
  
  // Hour selection
  selectedHourIndex: number;
  setSelectedHourIndex: (index: number) => void;
  selectedHourTimestamp: string | null;
  routingPairs: RoutingPair[];
  
  // Loading state
  loading: boolean;
  error: string | null;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CommunityData | null>(null);
  const [totals, setTotals] = useState<CommunityTotals | null>(null);
  const [trends, setTrends] = useState<HourlyTrend[]>([]);
  const [snapshots, setSnapshots] = useState<HomeSnapshot[]>([]);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const communityData = await loadCommunityData();
        setData(communityData);

        // Compute aggregations
        const computedTotals = computeCommunityTotals(communityData.timeseries);
        setTotals(computedTotals);

        const computedTrends = computeHourlyTrends(communityData.hour_groups);
        setTrends(computedTrends);

        const computedSnapshots = computeHomeSnapshots(
          communityData.last_row_per_home,
          communityData.timeseries
        );
        setSnapshots(computedSnapshots);

        // Set default hour to first hour with microgrid activity
        const defaultHourIdx = findDefaultHourIndex(communityData.hour_groups);
        setSelectedHourIndex(defaultHourIdx);

        setLoading(false);
      } catch (err) {
        console.error("Failed to load community data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);
      }
    }

    load();
  }, []);

  // Compute routing pairs for selected hour
  const selectedHourTimestamp = data?.unique_hours[selectedHourIndex] || null;
  const routingPairs = React.useMemo(() => {
    if (!data || !selectedHourTimestamp) return [];
    const hourRows = data.hour_groups.get(selectedHourTimestamp) || [];
    return computeRoutingPairs(hourRows);
  }, [data, selectedHourTimestamp]);

  const value: AdminDataContextType = {
    data,
    totals,
    trends,
    snapshots,
    selectedHourIndex,
    setSelectedHourIndex,
    selectedHourTimestamp,
    routingPairs,
    loading,
    error,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return context;
}

