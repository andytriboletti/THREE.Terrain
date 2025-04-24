import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Sky, Stars } from '@react-three/drei';
import { Physics, HeightfieldCollider } from '@react-three/rapier';
import RapierCharacterController from './RapierCharacterController';
import RapierCharacter from './RapierCharacter';
import { terminal } from "virtual:terminal";

// Define keyboard controls map
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'zoom_in', keys: ['1'] },
  { name: 'zoom_out', keys: ['2'] }
];

// Terrain component that uses the existing THREE.Terrain
const Terrain = ({ terrainScene, heightData, terrainDimensions }) => {
  const terrainRef = useRef();

  useEffect(() => {
    if (terrainScene && terrainRef.current) {
      // Add the terrain mesh to our group
      terrainRef.current.add(terrainScene);

      // Make the terrain mesh available to the window for height checks
      window.terrainMesh = terrainScene;

      // Create a function to get terrain height at a specific position
      window.getTerrainHeight = (x, z) => {
        if (!heightData || !terrainDimensions) return 0;

        // Convert world coordinates to heightmap indices
        const { width, height, maxHeight } = terrainDimensions;

        // Adjust for terrain position and scale
        const terrainX = Math.floor((x + width/2) / width * (heightData.length - 1));
        const terrainZ = Math.floor((z + height/2) / height * (heightData[0].length - 1));

        // Clamp to valid indices
        const clampedX = Math.max(0, Math.min(heightData.length - 1, terrainX));
        const clampedZ = Math.max(0, Math.min(heightData[0].length - 1, terrainZ));

        // Get height from heightmap
        return heightData[clampedX][clampedZ] * maxHeight;
      };
    }
  }, [terrainScene, heightData, terrainDimensions]);

  // Create a heightfield collider for the terrain
  const createHeightfieldCollider = () => {
    if (!heightData || !terrainDimensions) return null;

    const { width, height, maxHeight } = terrainDimensions;

    // HeightfieldCollider expects a 1D array of heights
    const nrows = heightData.length;
    const ncols = heightData[0].length;
    const heights = new Float32Array(nrows * ncols);

    // Fill the heights array
    for (let i = 0; i < nrows; i++) {
      for (let j = 0; j < ncols; j++) {
        heights[i * ncols + j] = heightData[i][j] * maxHeight;
      }
    }

    return (
      <HeightfieldCollider
        args={[
          nrows - 1, // number of rows - 1
          ncols - 1, // number of columns - 1
          heights, // heights as a flat array
          { x: width, y: maxHeight, z: height } // scale
        ]}
        position={[-width/2, 0, -height/2]} // Center the heightfield
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to match THREE.Terrain orientation
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
const RapierScene = ({ terrainScene, heightData, terrainDimensions }) => {
  const [physicsEnabled, setPhysicsEnabled] = useState(false);

  useEffect(() => {
    // Enable physics once terrain data is loaded
    if (terrainScene && heightData && terrainDimensions) {
      setPhysicsEnabled(true);
      terminal.log("Physics enabled with terrain data");
    }
  }, [terrainScene, heightData, terrainDimensions]);

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
            <Terrain
              terrainScene={terrainScene}
              heightData={heightData}
              terrainDimensions={terrainDimensions}
            />

            <RapierCharacterController
              position={[0, 300, 0]}
              jumpVel={7}
              maxVelLimit={8}
              sprintMult={2}
              floatHeight={0.5}
              camInitDis={-10}
              camMaxDis={-50}
              camMinDis={-1}
            >
              <RapierCharacter />
            </RapierCharacterController>
          </Physics>
        )}
      </Canvas>
    </KeyboardControls>
  );
};

export default RapierScene;
