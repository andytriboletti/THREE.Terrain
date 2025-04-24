import React from 'react';
import { Html } from '@react-three/drei';

export default function Instructions() {
  return (
    <Html fullscreen>
      <div className="instructions">
        <h3>Character Controls</h3>
        <p>WASD / Arrow Keys = Move</p>
        <p>Space = Jump</p>
        <p>Shift = Run</p>
        <p>1 = Zoom In</p>
        <p>2 = Zoom Out</p>
        <p>Mouse Wheel = Zoom</p>
        <p>O = Toggle Orbit Controls</p>
      </div>
    </Html>
  );
}
