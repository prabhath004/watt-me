import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserHomeLatest = {
  pv_w: number;
  load_w: number;
  soc_pct: number;
  sharing_w: number;
  receiving_w: number;
  grid_import_w: number;
  grid_export_w: number;
};

export type UserTodayPoint = {
  ts: string;
  pv_w: number;
  load_w: number;
  sent_to_grid_w: number;
};

export type UserDailyStats = {
  prod_wh: number;
  use_wh: number;
  credits_net_wh: number;
  mg_used_wh: number;
};

export function useUserData(microgridId: string | null, homeId: string | null) {
  const [homeLatest, setHomeLatest] = useState<UserHomeLatest | null>(null);
  const [todayData, setTodayData] = useState<UserTodayPoint[]>([]);
  const [dailyStats, setDailyStats] = useState<UserDailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!microgridId || !homeId) return;

    let channel: any;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch latest home state
        const { data: latestData, error: latestError } = await supabase
          .from('v_home_latest')
          .select('pv_w, load_w, soc_pct, sharing_w, receiving_w, grid_import_w, grid_export_w')
          .eq('microgrid_id', microgridId)
          .eq('home_id', homeId)
          .maybeSingle();

        if (latestError) throw latestError;
        setHomeLatest(latestData || {
          pv_w: 0,
          load_w: 0,
          soc_pct: 50,
          sharing_w: 0,
          receiving_w: 0,
          grid_import_w: 0,
          grid_export_w: 0
        });

        // Fetch today's time series
        const { data: todayPoints, error: todayError } = await supabase
          .from('v_user_today')
          .select('ts, pv_w, load_w, sent_to_grid_w')
          .eq('microgrid_id', microgridId)
          .eq('home_id', homeId)
          .order('ts');

        if (todayError) throw todayError;
        setTodayData(todayPoints || []);

        // Fetch daily rollup stats
        const { data: statsData, error: statsError } = await supabase
          .from('rollup_daily_home')
          .select('prod_wh, use_wh, credits_net_wh, mg_used_wh')
          .eq('microgrid_id', microgridId)
          .eq('home_id', homeId)
          .eq('day', new Date().toISOString().split('T')[0])
          .maybeSingle();

        if (statsError) throw statsError;
        setDailyStats(statsData || {
          prod_wh: 0,
          use_wh: 0,
          credits_net_wh: 0,
          mg_used_wh: 0
        });

      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime updates
    channel = supabase
      .channel('user-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tick_state',
          filter: `home_id=eq.${homeId}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [microgridId, homeId]);

  return { homeLatest, todayData, dailyStats, loading, error };
}
