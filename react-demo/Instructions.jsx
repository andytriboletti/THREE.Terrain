import React from 'react';
import { Html } from '@react-three/drei';

export default function Instructions() {
  return (
    <Html fullscreen>
      <div className="instructions">
        <h3>Controls</h3>
        <p>WASD / Arrow Keys = Move</p>
        <p>Space = Jump</p>
        <p>Shift = Run</p>
        <p>1 = Zoom In (faster)</p>
        <p>2 = Zoom Out (much farther)</p>
        <p>Mouse Wheel = Zoom (smooth)</p>
        <p>P = Toggle Physics Debug</p>
        <p>O = Toggle Orbit Controls</p>
      </div>
    </Html>
  );
}
