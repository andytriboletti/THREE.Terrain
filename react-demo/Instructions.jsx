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
        <p>Mouse = Look around (click and hold left mouse button)</p>
        <p>Mouse Wheel = Zoom</p>
        <p>P = Toggle Physics Debug</p>
        <p>O = Toggle Orbit Controls</p>
      </div>
    </Html>
  );
}
