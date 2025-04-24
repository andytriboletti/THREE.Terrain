import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Sky, Stars } from '@react-three/drei';
import { Physics, HeightfieldCollider } from '@react-three/rapier';
import Ecctrl, { EcctrlAnimation } from '../ecctrl/src/Ecctrl';
import ECCtrlCharacter from './ECCtrlCharacter';
import { terminal } from "virtual:terminal";

// Define keyboard controls map for ECCtrl
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'leftward', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'rightward', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'action1', keys: ['1'] },
  { name: 'action2', keys: ['2'] },
  { name: 'action3', keys: ['3'] },
  { name: 'action4', keys: ['4'] }
];

// Terrain component that uses the existing THREE.Terrain
const Terrain = ({ terrainScene }) => {
  const terrainRef = useRef();

  useEffect(() => {
    if (terrainScene && terrainRef.current) {
      // Add the terrain mesh to our group
      terrainRef.current.add(terrainScene);

      // Make the terrain mesh available to the window for height checks
      window.terrainMesh = terrainScene.children[0];

      // Create a function to get terrain height at a specific position
      window.getTerrainHeight = (x, z) => {
        // This is a simplified height check - in a real application,
        // you would use raycasting or sample the terrain height data
        return 0; // Default height
      };
    }
  }, [terrainScene]);

  // Create a heightfield collider for the terrain
  const createHeightfieldCollider = () => {
    if (!terrainScene) return null;

    // Get the terrain mesh
    const terrainMesh = terrainScene.children[0];
    if (!terrainMesh || !terrainMesh.geometry) return null;

    // Get the terrain dimensions
    const width = 63;
    const depth = 63;
    const widthExtents = 1024;
    const depthExtents = 1024;

    // Extract height data from the terrain mesh
    const geometry = terrainMesh.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const vertices = positionAttribute.array;

    // Create a heightfield array
    const heights = new Float32Array((width + 1) * (depth + 1));

    // Extract height values from vertices
    for (let i = 0; i <= depth; i++) {
      for (let j = 0; j <= width; j++) {
        // In Three.js, Y is up, but we need to extract it based on the terrain's orientation
        // For a plane rotated to be horizontal, we need the Z value
        const vertexIndex = i * (width + 1) + j;
        const posIndex = vertexIndex * 3 + 2; // Y is at index 2 for a rotated plane

        if (posIndex < vertices.length) {
          heights[i * (width + 1) + j] = vertices[posIndex];
        }
      }
    }

    terminal.log("Created heightfield collider with dimensions:", width, depth);

    return (
      <HeightfieldCollider
        args={[
          width, // number of rows
          depth, // number of columns
          heights, // heights as a flat array
          { x: widthExtents, y: 1, z: depthExtents } // scale
        ]}
        position={[-widthExtents/2, 0, -depthExtents/2]} // Center the heightfield
        rotation={[0, 0, 0]} // No rotation needed as we extracted heights correctly
      />
    );
  };

  return (
    <group ref={terrainRef}>
      {createHeightfieldCollider()}
    </group>
  );
};

// Main scene component
const RapierScene = ({ terrainScene }) => {
  const [physicsEnabled, setPhysicsEnabled] = useState(false);

  useEffect(() => {
    // Enable physics once terrain scene is loaded
    if (terrainScene) {
      setPhysicsEnabled(true);
      terminal.log("Physics enabled with terrain data");
    }
  }, [terrainScene]);

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
        <Sky sunPosition={[100, 100, 20]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {physicsEnabled && (
          <Physics gravity={[0, -9.81, 0]} debug={false}>
            <Terrain terrainScene={terrainScene} />

            <Ecctrl
              position={[0, 300, 0]}
              jumpVel={7}
              maxVelLimit={8}
              sprintMult={2}
              floatHeight={0.5}
              camInitDis={-10}
              camMaxDis={-50}
              camMinDis={-1}
              camFollowMult={11}
              turnSpeed={15}
              slopeMaxAngle={1}
              debug={true}
              autoBalance={false}
              enableDamping={false}
              enableJoystick={false}
              enableFlyMode={false}
              showDebugGui={false}
              rigidBodyType="dynamic"
            >
              <ECCtrlCharacter />
            </Ecctrl>
          </Physics>
        )}
      </Canvas>
    </KeyboardControls>
  );
};

export default RapierScene;
