import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  microgridId: string;
}

export function AdminHeader({ microgridId }: AdminHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-b-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-green-600 dark:bg-green-400 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.3)]">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">ShareWatt</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Badge className="bg-green-600 dark:bg-green-400 text-white border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.3)] px-4 py-2 text-base font-black">
              Admin
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
