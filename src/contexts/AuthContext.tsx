import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type Role = 'admin' | 'user';

const STORAGE_KEY = 'neighborgrid_auth';

export interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  userId?: string | null;
  homeId?: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: Role, userIdOrHomeId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    userId: null,
    homeId: null,
  });

  useEffect(() => {
    // Check for existing session on mount
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (role: Role, userIdOrHomeId?: string) => {
    const newState: AuthState = {
      isAuthenticated: true,
      role,
      userId: role === 'admin' ? userIdOrHomeId || null : null,
      homeId: role === 'user' ? userIdOrHomeId || 'H001' : null,
    };
    setAuthState(newState);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const logout = () => {
    const newState: AuthState = {
      isAuthenticated: false,
      role: null,
      userId: null,
      homeId: null,
    };
    setAuthState(newState);
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/login/user');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export default for Fast Refresh compatibility
export default AuthProvider;
