type AdminOverview = {
  microgrid_id: string;
  updated_at: string;
  pricing: {
    fair_rate_per_kwh: number;
    utility_import_per_kwh: number;
    utility_export_per_kwh: number;
  };
  community_totals: {
    production_kwh_today: number;
    microgrid_used_kwh_today: number;
    grid_import_kwh_today: number;
    grid_export_kwh_today: number;
  };
};

type AdminHouse = {
  id: string;
  solar_now_kw: number;
  solar_today_kwh: number;
  consumption_now_kw: number;
  consumption_today_kwh: number;
  to_microgrid_now_kw: number;
  to_microgrid_today_kwh: number;
  from_microgrid_now_kw: number;
  from_microgrid_today_kwh: number;
  battery_soc_pct: number;
  credits_today_earned_kwh: number;
  credits_today_used_kwh: number;
  credits_month_net_kwh: number;
};

type AdminGridExchange = {
  updated_at: string;
  to_grid_now_kw_total: number;
  to_grid_today_kwh_total: number;
  from_grid_now_kw_total: number;
  grid_drawers_now: { id: string; kw: number }[];
  grid_exporters_now_top?: { id: string; kw: number }[];
  unserved_need_kw: number;
  is_islanded: boolean;
};

type AdminTrends = {
  times: string[];
  production_kwh: number[];
  microgrid_used_kwh: number[];
  grid_kwh: number[];
};

type UserSummary = {
  home_id: string;
  updated_at: string;
  solar_now_kw: number;
  solar_today_kwh: number;
  consumption_now_kw: number;
  consumption_today_kwh: number;
  surplus_today_kwh: number;
  battery_soc_pct: number;
  battery_charge_today_kwh: number;
  battery_discharge_today_kwh: number;
  credits_today_earned_kwh: number;
  credits_today_used_kwh: number;
  credits_month_net_kwh: number;
  to_microgrid_now_kw: number;
  from_microgrid_now_kw: number;
};

type UserPatterns = {
  times: string[];
  solar_kwh: number[];
  consumption_kwh: number[];
  to_grid_kwh?: number[];
};

type UserSharing = {
  to_microgrid_now_kw: number;
  from_microgrid_now_kw: number;
  partners: {
    to: string[];
    from: string[];
  };
  unused_surplus_to_grid_now_kw: number;
};

type UserForecast = {
  days: string[];
  solar_kwh: number[];
  consumption_kwh: number[];
  credits_month_end_projection_kwh: number;
};

class MockDataProvider {
  private adminOverview: AdminOverview | null = null;
  private adminHouses: AdminHouse[] = [];
  private adminGridExchange: AdminGridExchange | null = null;
  private adminTrends: AdminTrends | null = null;
  private userSummaries: Map<string, UserSummary> = new Map();
  private userPatterns: Map<string, UserPatterns> = new Map();
  private userSharing: Map<string, UserSharing> = new Map();
  private userForecast: Map<string, UserForecast> = new Map();
  private listeners: (() => void)[] = [];
  private tickInterval: NodeJS.Timeout | null = null;
  private frameIndex = 0;

  async init() {
    await this.loadInitialData();
    this.startTicking();
  }

  private async loadInitialData() {
    try {
      const [overview, houses, gridExchange, trends] = await Promise.all([
        fetch('/mock/admin_overview.json').then(r => r.json()),
        fetch('/mock/admin_houses.json').then(r => r.json()),
        fetch('/mock/admin_grid_exchange.json').then(r => r.json()),
        fetch('/mock/admin_trends.json').then(r => r.json()),
      ]);

      this.adminOverview = overview;
      this.adminHouses = houses;
      this.adminGridExchange = gridExchange;
      this.adminTrends = trends;

      // Load user data for H7 as default
      const [summary, patterns, sharing, forecast] = await Promise.all([
        fetch('/mock/user_H7_summary.json').then(r => r.json()),
        fetch('/mock/user_H7_patterns.json').then(r => r.json()),
        fetch('/mock/user_H7_sharing.json').then(r => r.json()),
        fetch('/mock/user_H7_forecast.json').then(r => r.json()),
      ]);

      this.userSummaries.set('H7', summary);
      this.userPatterns.set('H7', patterns);
      this.userSharing.set('H7', sharing);
      this.userForecast.set('H7', forecast);
    } catch (error) {
      console.error('Error loading mock data:', error);
    }
  }

  private startTicking() {
    // Auto-refresh every 30 seconds
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 30000);
  }

  tick() {
    // Simulate data updates by slightly modifying values
    this.frameIndex++;
    this.simulateDataUpdate();
    this.notifyListeners();
  }

  private simulateDataUpdate() {
    // Randomly adjust some values to simulate live updates
    if (this.adminHouses.length > 0) {
      this.adminHouses = this.adminHouses.map(house => ({
        ...house,
        solar_now_kw: Math.max(0, house.solar_now_kw + (Math.random() - 0.5) * 0.2),
        consumption_now_kw: Math.max(0.1, house.consumption_now_kw + (Math.random() - 0.5) * 0.1),
        battery_soc_pct: Math.max(20, Math.min(100, house.battery_soc_pct + (Math.random() - 0.5) * 2)),
      }));
    }

    // Update grid exchange
    if (this.adminGridExchange) {
      this.adminGridExchange = {
        ...this.adminGridExchange,
        updated_at: new Date().toISOString(),
        to_grid_now_kw_total: Math.max(0, this.adminGridExchange.to_grid_now_kw_total + (Math.random() - 0.5) * 0.2),
        from_grid_now_kw_total: Math.max(0, this.adminGridExchange.from_grid_now_kw_total + (Math.random() - 0.5) * 0.3),
      };
    }

    // Update user summary
    const h7Summary = this.userSummaries.get('H7');
    if (h7Summary) {
      this.userSummaries.set('H7', {
        ...h7Summary,
        solar_now_kw: Math.max(0, h7Summary.solar_now_kw + (Math.random() - 0.5) * 0.2),
        consumption_now_kw: Math.max(0.1, h7Summary.consumption_now_kw + (Math.random() - 0.5) * 0.1),
        battery_soc_pct: Math.max(20, Math.min(100, h7Summary.battery_soc_pct + (Math.random() - 0.5) * 2)),
        updated_at: new Date().toISOString(),
      });
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  getAdminOverview(): AdminOverview | null {
    return this.adminOverview;
  }

  getAdminHouses(): AdminHouse[] {
    return this.adminHouses;
  }

  getAdminGridExchange(): AdminGridExchange | null {
    return this.adminGridExchange;
  }

  getAdminTrends(): AdminTrends | null {
    return this.adminTrends;
  }

  getUserSummary(homeId: string): UserSummary | null {
    return this.userSummaries.get(homeId) || null;
  }

  getUserPatterns(homeId: string): UserPatterns | null {
    return this.userPatterns.get(homeId) || null;
  }

  getUserSharing(homeId: string): UserSharing | null {
    return this.userSharing.get(homeId) || null;
  }

  getUserForecast(homeId: string): UserForecast | null {
    return this.userForecast.get(homeId) || null;
  }

  cleanup() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
  }
}

export const mockDataProvider = new MockDataProvider();
export type { AdminOverview, AdminHouse, AdminGridExchange, AdminTrends, UserSummary, UserPatterns, UserSharing, UserForecast };
