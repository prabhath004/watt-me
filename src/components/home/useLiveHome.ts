import { useState, useEffect } from 'react';

export interface LiveHome {
  id: string;
  pv: number;
  load: number;
  soc: number;
  share: number;
  recv: number;
  imp: number;
  exp: number;
  creditsDelta: number;
}

export interface ChartPoint {
  time: string;
  solar: number;
  consumption: number;
  battery: number;
  sharing: number;
  receiving: number;
  gridImport: number;
  gridExport: number;
}

export interface CommunityData {
  prod: number;
  mg_used: number;
  unserved: number;
}

export interface GridData {
  imp: number;
  exp: number;
}

export interface LiveHomeData {
  home: LiveHome | null;
  grid: GridData;
  community: CommunityData;
  history: ChartPoint[];
  lastUpdate: string | null;
  connected: boolean;
  error: string | null;
}

export function useLiveHome(homeId: string, maxDataPoints = 60): LiveHomeData {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveHome, setLiveHome] = useState<LiveHome | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [grid, setGrid] = useState<GridData>({ imp: 0, exp: 0 });
  const [community, setCommunity] = useState<CommunityData>({ prod: 0, mg_used: 0, unserved: 0 });

  useEffect(() => {
    const es = new EventSource("http://localhost:3001/stream");

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Find this user's home
        const myHome = data.homes.find((h: LiveHome) => h.id === homeId);
        
        if (myHome) {
          setLiveHome(myHome);
          
          // Update grid and community data
          if (data.grid) {
            setGrid(data.grid);
          }
          if (data.community) {
            setCommunity(data.community);
          }
          
          // Add to chart
          const time = new Date(data.ts);
          const newPoint: ChartPoint = {
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            solar: myHome.pv,
            consumption: myHome.load,
            battery: myHome.soc,
            sharing: myHome.share,
            receiving: myHome.recv,
            gridImport: myHome.imp,
            gridExport: myHome.exp,
          };
          
          setChartData(prev => {
            const updated = [...prev, newPoint];
            return updated.slice(-maxDataPoints);
          });
          
          setLastUpdate(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }));
        }
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
        setError("Failed to parse live data");
      }
    };

    es.onerror = () => {
      setConnected(false);
      setError("Connection lost. Make sure simulator is running.");
    };

    return () => es.close();
  }, [homeId, maxDataPoints]);

  return {
    home: liveHome,
    grid,
    community,
    history: chartData,
    lastUpdate,
    connected,
    error
  };
}
