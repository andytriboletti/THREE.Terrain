import React from 'react';
import { createRoot } from 'react-dom/client';
import './ErrorReporter'; // Import error reporter before anything else
import App from './App';

// Make sure we're using React
console.log('React version:', React.version);

// Create root and render app
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log that React has mounted
console.log('React app mounted');
