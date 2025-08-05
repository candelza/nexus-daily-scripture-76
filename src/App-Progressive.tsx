import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Progressive loading states
type LoadingState = 'initializing' | 'providers' | 'router' | 'complete' | 'error';

interface ProgressiveAppState {
  state: LoadingState;
  error?: Error;
  progress: number;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Import AppRoutes directly to avoid lazy loading issues
import AppRoutes from './AppRoutes';

const ProgressiveApp: React.FC = () => {
  const [appState, setAppState] = useState<ProgressiveAppState>({
    state: 'initializing',
    progress: 0
  });

  useEffect(() => {
    const loadApp = async () => {
      try {
        console.log('🚀 Starting progressive app loading...');
        
        // Step 1: Initialize providers
        setAppState({ state: 'providers', progress: 25 });
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ Providers initialized');
        
        // Step 2: Setup router
        setAppState({ state: 'router', progress: 50 });
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ Router setup');
        
        // Step 3: Complete loading
        setAppState({ state: 'complete', progress: 100 });
        console.log('✅ App loading complete');
        
      } catch (error) {
        console.error('💥 App loading failed:', error);
        setAppState({ 
          state: 'error', 
          error: error as Error, 
          progress: 0 
        });
      }
    };

    loadApp();
  }, []);

  // Loading screen
  if (appState.state !== 'complete') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>
            {appState.state === 'error' ? '⚠️' : '📖'}
          </div>
          
          <h2 style={{ color: '#333', marginBottom: '16px' }}>
            {appState.state === 'error' ? 'Loading Error' : 'ReadBible Faith Nexus Hub'}
          </h2>
          
          {appState.state === 'error' ? (
            <div>
              <p style={{ color: '#dc2626', marginBottom: '16px' }}>
                Failed to initialize application
              </p>
              <details style={{
                background: '#f3f4f6',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Error Details
                </summary>
                <pre style={{ fontSize: '12px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {appState.error?.toString()}
                </pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                🔄 Reload
              </button>
              <a
                href="/debug.html"
                style={{
                  background: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px'
                }}
              >
                🧪 Debug
              </a>
            </div>
          ) : (
            <div>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                {appState.state === 'initializing' && 'Initializing...'}
                {appState.state === 'providers' && 'Loading providers...'}
                {appState.state === 'router' && 'Setting up navigation...'}
              </p>
              
              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: `${appState.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                {appState.progress}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main app
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default ProgressiveApp;