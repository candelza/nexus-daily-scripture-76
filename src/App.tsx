import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AcceptInvite from "./pages/admin/AcceptInvite";
import NotFound from "./pages/NotFound";
import { useAuth } from './hooks/useAuth';
import { checkAdminAccess } from './services/adminService';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

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
        const isAdmin = await checkAdminAccess();
        setHasAccess(isAdmin);
      } catch (error) {
        console.error('Error verifying admin access:', error);
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

  return hasAccess ? <Outlet /> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="accept-invite" element={<AcceptInvite />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
