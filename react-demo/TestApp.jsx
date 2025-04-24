import React, { useState } from 'react';

export default function TestApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#282c34',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>React is Working!</h1>
      <p>This is a simple React component to verify that React is loading correctly.</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          margin: '20px',
          cursor: 'pointer'
        }}
      >
        Clicked {count} times
      </button>
      <p>
        Once you confirm React is working, you can switch back to the main App component.
      </p>
    </div>
  );
}
