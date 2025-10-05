import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserMicrogrid() {
  const { userId } = useAuth();
  const [microgridId, setMicrogridId] = useState<string | null>(null);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('microgrid_id, home_id')
          .eq('id', userId)
          .single();

        if (error) throw error;
        
        setMicrogridId(data.microgrid_id);
        setHomeId(data.home_id);
      } catch (err) {
        console.error('Error fetching user microgrid:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return { microgridId, homeId, loading };
}
