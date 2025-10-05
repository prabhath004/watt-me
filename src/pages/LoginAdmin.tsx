import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });

        if (error) throw error;

        toast({
          title: 'Account created',
          description: 'You can now sign in immediately.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Set admin role in AuthContext after successful Supabase login
        login('admin');
        navigate('/admin');
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? 'Sign-up failed' : 'Sign-in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupDemoUsers = async () => {
    setSetupLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-demo-users');
      
      if (error) throw error;
      
      toast({
        title: 'Demo users created!',
        description: 'You can now sign in with admin@demo.com or user@demo.com (password: demo123)',
      });
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const isDisabled = !email || !password || loading;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      <div className="w-full max-w-[520px]">
        <div 
          className="p-12 bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            boxShadow: '0 0 0 1px rgba(34,197,94,0.1), 0 20px 25px -5px rgba(34,197,94,0.1), 0 10px 10px -5px rgba(34,197,94,0.04)'
          }}
        >
          {/* Brand lockup */}
          <div className="flex items-start gap-6 mb-10">
            <div 
              className="flex h-16 w-16 items-center justify-center bg-green-600 dark:bg-green-400"
            >
              <Zap className="h-8 w-8 text-white dark:text-black" />
            </div>
            <div className="flex-1">
              <div className="font-black text-2xl mb-2 text-green-600 dark:text-green-400 tracking-tight">
                ShareWatt
              </div>
              <h1 className="text-4xl font-black mb-3 text-gray-800 dark:text-white tracking-tight">
                {isSignUp ? 'Admin Sign up' : 'Admin Sign in'}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-base text-gray-600 dark:text-gray-400 font-medium">For microgrid operators</p>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-black uppercase tracking-wider bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400"
                >
                  Operator Access
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label htmlFor="email" className="text-sm font-black text-green-600 dark:text-green-400 uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="mt-3 h-16 text-lg border-2 border-green-600 dark:border-green-400 focus:border-green-600 dark:focus:border-green-400 focus:ring-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-medium transition-all duration-200"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-black text-green-600 dark:text-green-400 uppercase tracking-wider">Password</Label>
              <div className="relative mt-3">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-16 pr-16 text-lg border-2 border-green-600 dark:border-green-400 focus:border-green-600 dark:focus:border-green-400 focus:ring-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-medium transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none p-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-green-600 dark:text-green-400" /> : <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />}
                </button>
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isDisabled}
                className={`w-full h-20 text-xl font-black transition-all duration-200 focus:outline-none ${
                  isDisabled 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed border-2 border-gray-300 dark:border-gray-600' 
                    : 'bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:bg-green-700 dark:hover:bg-green-300 hover:border-green-700 dark:hover:border-green-300'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </div>
                ) : (
                  isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-black text-sm uppercase tracking-wider hover:underline focus:outline-none transition-colors duration-200"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
              <Link
                to="/login/user"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-black text-sm uppercase tracking-wider hover:underline focus:outline-none transition-colors duration-200"
              >
                Sign in as User
              </Link>
            </div>

            {/* Demo Setup Button - Prominent */}
            <div className="pt-8 border-t-2 border-green-600 dark:border-green-400">
              <p className="text-base text-center mb-6 text-green-600 dark:text-green-400 font-black uppercase tracking-wider">
                First time here? Create demo accounts to get started
              </p>
              <Button
                type="button"
                onClick={setupDemoUsers}
                disabled={setupLoading}
                className={`w-full h-20 text-xl font-black transition-all duration-200 focus:outline-none ${
                  setupLoading 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed border-2 border-gray-300 dark:border-gray-600' 
                    : 'bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:bg-green-700 dark:hover:bg-green-300 hover:border-green-700 dark:hover:border-green-300'
                }`}
              >
                {setupLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
                    Setting up demo users...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6" />
                    SETUP DEMO USERS
                  </div>
                )}
              </Button>
              <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400 font-medium">
                Creates: admin@demo.com & user@demo.com (password: demo123)
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
