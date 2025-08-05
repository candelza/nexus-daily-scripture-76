import { createRoot } from 'react-dom/client'
import SimpleApp from './SimpleApp.tsx'
import './index.css'

// Debug information
console.log('🚀 ReadBible Simple Test Starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Location:', window.location.href);

// Simple React app initialization
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element (#root) not found in DOM');
  }
  
  console.log('📦 Root element found, mounting SimpleApp...');
  const root = createRoot(rootElement);
  
  root.render(<SimpleApp />);
  
  console.log('✅ SimpleApp mounted successfully');
} catch (error) {
  console.error('💥 Critical Error - Failed to mount SimpleApp:', error);
  
  // Fallback error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f9fafb;">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px; margin: 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">💥</div>
          <h1 style="color: #dc2626; margin-bottom: 16px;">Critical Error</h1>
          <p style="color: #6b7280; margin-bottom: 20px;">Failed to initialize Simple React Test</p>
          <pre style="font-size: 12px; background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: left; white-space: pre-wrap;">${error}</pre>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin-right: 12px;">🔄 Reload</button>
          <a href="/debug.html" style="background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px;">🧪 Debug Page</a>
        </div>
      </div>
    `;
  }
}