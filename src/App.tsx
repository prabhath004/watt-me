import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load pages for better performance
const Admin = lazy(() => import("./pages/Admin"));
const AdminCommunity = lazy(() => import("./pages/AdminCommunity"));
const AdminLive = lazy(() => import("./pages/AdminLive"));
const UserApp = lazy(() => import("./pages/UserApp"));
const UserAppLive = lazy(() => import("./pages/UserAppLive"));
const HomeDetails = lazy(() => import("./pages/HomeDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginUser = lazy(() => import("./pages/LoginUser"));
const LoginAdmin = lazy(() => import("./pages/LoginAdmin"));
const Forbidden = lazy(() => import("./pages/Forbidden"));
const RootRedirect = lazy(() => import("./pages/RootRedirect"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="text-center" style={{ color: 'var(--text-dim)' }}>Loading...</div>
          </div>}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login/user" element={<LoginUser />} />
              <Route path="/login/admin" element={<LoginAdmin />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/community" 
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminCommunity />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/live" 
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLive />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute requireRole="user">
                    <UserApp />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/app/live" 
                element={
                  <ProtectedRoute requireRole="user">
                    <UserAppLive />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/home/:id" 
                element={
                  <ProtectedRoute requireRole="user">
                    <HomeDetails />
                  </ProtectedRoute>
                } 
              />
              <Route path="/forbidden" element={<Forbidden />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
