import React from 'react';

// Simple test component to verify React is working
const SimpleApp: React.FC = () => {
  console.log('🎯 SimpleApp component rendered');
  
  return (
    <div style={{
      display: 'flex',
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
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#333', marginBottom: '16px' }}>
          React is Working!
        </h1>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
          ReadBible Faith Nexus Hub - Simple Test Mode
        </p>
        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #0ea5e9',
          color: '#0369a1',
          marginBottom: '20px'
        }}>
          <strong>✅ React mounted successfully</strong><br/>
          <strong>✅ JavaScript is executing</strong><br/>
          <strong>✅ Styles are applied</strong><br/>
          <strong>✅ Components are rendering</strong>
        </div>
        <button
          onClick={() => {
            console.log('Button clicked - React events working');
            alert('React events are working!');
          }}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '12px'
          }}
        >
          Test React Events
        </button>
        <button
          onClick={() => window.location.href = '/debug.html'}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Debug Page
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;