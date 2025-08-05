import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

// Debug information
console.log('🚀 ReadBible Faith Nexus Hub Starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Using fallback');

// Global error handling
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  console.error('Source:', event.filename, 'Line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

// React app initialization
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element (#root) not found in DOM');
  }
  
  console.log('📦 Mounting React app with ErrorBoundary...');
  const root = createRoot(rootElement);
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('✅ React app mounted successfully');
} catch (error) {
  console.error('💥 Critical Error - Failed to mount React app:', error);
  
  // Fallback error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f9fafb;">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px; margin: 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">💥</div>
          <h1 style="color: #dc2626; margin-bottom: 16px;">Critical Error</h1>
          <p style="color: #6b7280; margin-bottom: 20px;">Failed to initialize ReadBible Faith Nexus Hub</p>
          <details style="text-align: left; background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <summary style="cursor: pointer; font-weight: bold;">Error Details</summary>
            <pre style="font-size: 12px; margin-top: 8px; white-space: pre-wrap;">${error}</pre>
          </details>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin-right: 12px;">🔄 Reload</button>
          <a href="/test.html" style="background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px;">🧪 Test Page</a>
        </div>
      </div>
    `;
  }
}
