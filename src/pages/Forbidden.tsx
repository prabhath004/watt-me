import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleGoToDashboard = () => {
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div 
          className="flex h-20 w-20 items-center justify-center rounded-full mx-auto mb-6"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <ShieldAlert className="h-10 w-10" style={{ color: 'var(--acc-amber)' }} />
        </div>
        
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          No access to this area
        </h1>
        
        <p className="text-lg mb-8" style={{ color: 'var(--text-dim)' }}>
          You're signed in as <span className="font-semibold">{role}</span>.
        </p>

        <Button
          onClick={handleGoToDashboard}
          className="text-white font-medium"
          style={{ backgroundColor: 'var(--acc-green)' }}
        >
          Go to my dashboard
        </Button>
      </div>
    </div>
  );
}
