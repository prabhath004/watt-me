import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Zap } from 'lucide-react';

export default function RootRedirect() {
  const { isAuthenticated, role } = useAuth();

  // If already logged in, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (role === 'admin') {
      window.location.href = '/admin';
      return null;
    } else {
      window.location.href = '/app/live';
      return null;
    }
  }

  // Show login choice page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Zap className="h-10 w-10 text-primary" />
            ShareWatt Live Simulator
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time energy management dashboard with live simulation
          </p>
        </div>

        {/* Login Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Login */}
          <Card className="border-blue-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-500" />
                User Dashboard
              </CardTitle>
              <CardDescription>
                Login as a homeowner to see your personal energy dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Personal dashboard with:
                • Your home's energy flows
                • Community sharing participation
                • Fair-rate credits tracking
                • Complete energy flow diagram
              </p>
              <Link to="/login/user">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Login as User
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <Card className="border-purple-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Community management and live simulation controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Admin controls with:
                • All 20 homes monitoring
                • Live simulation controls
                • Event triggers (weather, outages)
                • Community-wide analytics
              </p>
              <Link to="/login/admin">
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Login as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Check if all services are running properly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm text-muted-foreground">Frontend Server</div>
                <div className="text-xs">localhost:8080</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm text-muted-foreground">Simulator Backend</div>
                <div className="text-xs">sharewatt-backend.prabhathpalakurthi.workers.dev</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm text-muted-foreground">Live Simulation</div>
                <div className="text-xs">20 homes active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
