import React, { useState, useEffect } from 'react';
import RapierDemo from './RapierDemo';
import ErrorBoundary from './ErrorBoundary';
import './styles.css';

// Keyboard control map
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
  // Optional animation key map
  { name: "action1", keys: ["1"] },
  { name: "action2", keys: ["2"] },
  { name: "action3", keys: ["3"] },
  { name: "action4", keys: ["KeyF"] },
];

export default function App() {
  const [debug, setDebug] = useState(false);

  // Toggle physics debug mode with 'P' key
  const handleKeyDown = (e) => {
    if (e.key === 'p' || e.key === 'P') {
      setDebug(!debug);
    }
  };

  // Add event listener for key press
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [debug]);

  // Test error reporting to make sure it's working
  useEffect(() => {
    console.log("App component mounted - error reporting should be active");

    // Intentionally log a test warning to verify error reporting
    console.warn("TEST WARNING: This is a test warning to verify error reporting");

    // Log any React errors that might be happening
    const originalError = console.error;
    console.error = function(...args) {
      // Check if this is a React error
      const errorString = args.join(' ');
      if (errorString.includes('React') || errorString.includes('Warning:')) {
        originalError.apply(console, ['REACT ERROR DETECTED:', ...args]);
      } else {
        originalError.apply(console, args);
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <>
      <ErrorBoundary>
        {/* Always render the Rapier implementation */}
        <RapierDemo />

        {/* Instructions overlay */}
        <div className="instructions">
          <h2>Controls</h2>
          <p>WASD / Arrow Keys: Move</p>
          <p>Space: Jump</p>
          <p>Shift: Sprint</p>
          <p>1/2: Zoom In/Out</p>
          <p>Mouse Wheel: Zoom</p>
          <p>P: Toggle Physics Debug</p>
        </div>
      </ErrorBoundary>
    </>
  );
}
