import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error handling for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Mounting React app...');
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('React app mounted successfully');
} catch (error) {
  console.error('Failed to mount React app:', error);
  
  // Fallback error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, -apple-system, sans-serif;">
        <div style="text-align: center; color: #dc2626;">
          <div style="font-size: 24px; margin-bottom: 16px;">⚠️</div>
          <div>Failed to load Faith Nexus Hub</div>
          <div style="font-size: 14px; margin-top: 8px; color: #6b7280;">Check console for details</div>
        </div>
      </div>
    `;
  }
}
