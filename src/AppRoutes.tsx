import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Import pages directly to avoid loading issues
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AcceptInvite from "./pages/admin/AcceptInvite";
import NotFound from "./pages/NotFound";

import { useAuth } from './hooks/useAuth';
import { checkAdminAccess } from './services/adminService';

// Admin route wrapper
const AdminRoute = () => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const verifyAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        const isAdmin = await checkAdminAccess(user.id);
        setHasAccess(isAdmin);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAccess(false);
      }
    };

    verifyAccess();
  }, [user]);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminDashboard />;
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  console.log('🛣️ AppRoutes component loaded');
  
  try {
    return (
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/admin/accept-invite" element={<AcceptInvite />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  } catch (error) {
    console.error('🚨 AppRoutes error:', error);
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>⚠️ Routing Error</h2>
          <p style={{ marginBottom: '20px' }}>Failed to load application routes</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload App
          </button>
        </div>
      </div>
    );
  }
};

export default AppRoutes;