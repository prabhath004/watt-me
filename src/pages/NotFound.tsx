import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div 
          className="flex h-20 w-20 items-center justify-center rounded-full mx-auto mb-6"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>404</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Page not found
        </h1>
        
        <p className="text-lg mb-8" style={{ color: 'var(--text-dim)' }}>
          The page you're looking for doesn't exist.
        </p>

        <a 
          href="/" 
          className="inline-block px-6 py-3 rounded-2xl font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            backgroundColor: 'var(--acc-green)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
