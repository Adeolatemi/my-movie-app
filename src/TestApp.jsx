import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🎬 MovieFlix Test</h1>
      <p>App is loading...</p>
      <div style={{ 
        background: '#e50914', 
        color: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        margin: '1rem 0'
      }}>
        If you see this, React is working!
      </div>
    </div>
  );
};

export default TestApp;