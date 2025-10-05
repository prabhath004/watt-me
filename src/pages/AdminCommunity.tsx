/**
 * Admin Community Dashboard - View community-wide energy data and routing
 */

import { AdminDataProvider, useAdminData } from "@/contexts/AdminDataContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CommunityKPIs } from "@/components/admin/CommunityKPIs";
import { HourSelector } from "@/components/admin/HourSelector";
import { RoutingTable } from "@/components/admin/RoutingTable";
import { CommunityTrendChart } from "@/components/admin/CommunityTrendChart";
import { HomeSnapshotTable } from "@/components/admin/HomeSnapshotTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

function AdminCommunityContent() {
  const {
    totals,
    trends,
    snapshots,
    data,
    selectedHourIndex,
    setSelectedHourIndex,
    selectedHourTimestamp,
    routingPairs,
    loading,
    error,
  } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AdminHeader />
        <div className="max-w-7xl mx-auto mt-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AdminHeader />
        <div className="max-w-7xl mx-auto mt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              {error}
              <br />
              <span className="text-xs mt-2 block">
                Make sure the data files exist at /public/data/community_timeseries.csv and
                /public/data/community_metadata.csv
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data || !totals || !data.unique_hours.length) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AdminHeader />
        <div className="max-w-7xl mx-auto mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              Community data is empty or invalid.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Community Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            10 homes • {data.unique_hours.length} hours • {(data.unique_hours.length / 24).toFixed(1)} days
          </p>
        </div>

        {/* KPI Cards */}
        <CommunityKPIs totals={totals} />

        {/* Hour Selector */}
        <HourSelector
          hours={data.unique_hours}
          selectedIndex={selectedHourIndex}
          onSelectIndex={setSelectedHourIndex}
        />

        {/* Routing Table */}
        <RoutingTable
          pairs={routingPairs}
          timestamp={selectedHourTimestamp}
        />

        {/* Trend Chart */}
        <CommunityTrendChart trends={trends} />

        {/* Home Snapshots */}
        <HomeSnapshotTable snapshots={snapshots} />
      </div>
    </div>
  );
}

export default function AdminCommunity() {
  return (
    <AdminDataProvider>
      <AdminCommunityContent />
    </AdminDataProvider>
  );
}

