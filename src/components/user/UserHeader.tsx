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
    <header className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-b-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-green-600 dark:bg-green-400 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.3)]">
              <Home className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">My Home</h1>
              <p className="text-lg font-black text-green-600 dark:text-green-400">ShareWatt • {familyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Badge className="bg-green-600 dark:bg-green-400 text-white border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.3)] px-4 py-2 text-base font-black">
              User
            </Badge>
            <Button
              variant="outline"
              size="lg"
              onClick={logout}
              className="border-3 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white transition-all duration-200 font-black text-base px-6 py-3"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
