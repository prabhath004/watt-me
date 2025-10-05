import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, LogOut } from 'lucide-react';

// Family name mapping for user display
const familyNames: Record<string, string> = {
  "H001": "Johnson Family",
  "H002": "Smith Family", 
  "H003": "Williams Family",
  "H004": "Brown Family",
  "H005": "Davis Family",
  "H006": "Miller Family",
  "H007": "Wilson Family",
  "H008": "Moore Family",
  "H009": "Taylor Family",
  "H010": "Anderson Family",
  "H011": "Thomas Family",
  "H012": "Jackson Family",
  "H013": "White Family",
  "H014": "Harris Family",
  "H015": "Martin Family",
  "H016": "Thompson Family",
  "H017": "Garcia Family",
  "H018": "Martinez Family",
  "H019": "Robinson Family",
  "H020": "Clark Family",
  "H021": "Rodriguez Family",
  "H022": "Lewis Family",
  "H023": "Lee Family",
  "H024": "Walker Family",
  "H025": "Hall Family"
};

interface UserHeaderProps {
  homeId: string;
}

export function UserHeader({ homeId }: UserHeaderProps) {
  const { logout } = useAuth();
  const familyName = familyNames[homeId] || `Home ${homeId}`;

  return (
    <header style={{ 
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'var(--surface)',
      boxShadow: 'var(--shadow-soft)'
    }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: 'var(--gradient-energy)' }}
            >
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>My Home</h1>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>NeighborGrid • {familyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Last update: —</span>
            <Badge variant="secondary" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}>
              User
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              style={{ color: 'var(--text-dim)' }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
