import { useEffect, useState } from 'react';
import { mockDataProvider } from '@/data/MockDataProvider';

export function useMockData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Initialize the provider
    mockDataProvider.init();

    // Subscribe to updates
    const unsubscribe = mockDataProvider.subscribe(() => {
      setTick(prev => prev + 1);
    });

    return () => {
      unsubscribe();
      mockDataProvider.cleanup();
    };
  }, []);

  return {
    adminOverview: mockDataProvider.getAdminOverview(),
    adminHouses: mockDataProvider.getAdminHouses(),
    adminGridExchange: mockDataProvider.getAdminGridExchange(),
    adminTrends: mockDataProvider.getAdminTrends(),
    getUserSummary: (homeId: string) => mockDataProvider.getUserSummary(homeId),
    getUserPatterns: (homeId: string) => mockDataProvider.getUserPatterns(homeId),
    getUserSharing: (homeId: string) => mockDataProvider.getUserSharing(homeId),
    getUserForecast: (homeId: string) => mockDataProvider.getUserForecast(homeId),
    manualTick: () => mockDataProvider.tick(),
  };
}
