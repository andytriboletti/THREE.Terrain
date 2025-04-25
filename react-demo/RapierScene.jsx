import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Sky, Stars, Box } from '@react-three/drei';
import { Physics, HeightfieldCollider, RigidBody } from '@react-three/rapier';
import { Group } from './R3FComponents';
import Ecctrl, { EcctrlAnimation } from '../ecctrl/src/Ecctrl';
import ECCtrlCharacter from './ECCtrlCharacter';
import { terminal } from "virtual:terminal";
import TerrainCollider from './TerrainCollider';
import * as THREE from 'three';

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
  const [heightData, setHeightData] = useState(null);
  const [terrainDimensions, setTerrainDimensions] = useState(null);

  useEffect(() => {
    if (terrainScene && terrainRef.current) {
      // Add the terrain mesh to our group
      terrainRef.current.add(terrainScene);

      // Get the terrain mesh
      const terrainMesh = terrainScene.children[0];

      // Make the terrain mesh available globally
      window.terrainMesh = terrainMesh;

      // Get the terrain dimensions from the window object (set in TerrainComponent)
      if (window.terrainHeightData) {
        setHeightData(window.terrainHeightData);

        // Get dimensions from the geometry
        const geometry = terrainMesh.geometry;
        const width = Math.sqrt(geometry.attributes.position.count) - 1;
        const depth = width;

        setTerrainDimensions({
          width: width,
          depth: depth,
          widthExtents: 1024,
          depthExtents: 1024,
          maxHeight: 512
        });

        // Create a function to get terrain height at a specific position using sampling
        // We'll use a simpler approach here and let the TerrainCollider handle raycasting
        window.getTerrainHeight = (x, z) => {
          // Skip raycasting in this function and use heightmap sampling directly

          // Fallback to heightmap sampling if raycasting fails
          // Convert world coordinates to heightmap indices
          const terrainWidth = width + 1;
          const terrainDepth = depth + 1;
          const widthExtents = 1024;
          const depthExtents = 1024;

          // Adjust coordinates to terrain space (centered at origin)
          const adjustedX = x + widthExtents / 2;
          const adjustedZ = z + depthExtents / 2;

          // Convert to heightmap indices
          const i = Math.floor((adjustedZ / depthExtents) * terrainDepth);
          const j = Math.floor((adjustedX / widthExtents) * terrainWidth);

          // Clamp indices to valid range
          const clampedI = Math.max(0, Math.min(terrainDepth - 1, i));
          const clampedJ = Math.max(0, Math.min(terrainWidth - 1, j));

          // Get height from heightmap
          const index = clampedI * terrainWidth + clampedJ;

          if (index >= 0 && index < window.terrainHeightData.length) {
            // Scale the height value to match the collider
            const heightValue = window.terrainHeightData[index];
            const dataMax = 512; // Known from the console output
            const dataMin = -512; // Known from the console output
            const dataRange = dataMax - dataMin;
            const maxHeight = 200; // Same as in createHeightfieldCollider

            // Normalize to 0-1 range and then scale to maxHeight
            return ((heightValue - dataMin) / dataRange) * maxHeight;
          }

          return 0; // Default height if out of bounds
        };
      }
    }
  }, [terrainScene]);

  // Create a heightfield collider for the terrain
  const createHeightfieldCollider = () => {
    if (!terrainScene || !heightData || !terrainDimensions) return null;

    const { width, depth, widthExtents, depthExtents } = terrainDimensions;

    terminal.log("Creating heightfield collider with dimensions:", width, depth);
    terminal.log("Using height data with length:", heightData.length);

    // Scale the height data to a reasonable range
    const scaledHeightData = new Float32Array(heightData.length);
    const maxHeight = 200; // Maximum height in world units
    const dataMax = Math.max(...heightData);
    const dataMin = Math.min(...heightData);
    const dataRange = dataMax - dataMin;

    // Scale the height data
    for (let i = 0; i < heightData.length; i++) {
      // Normalize to 0-1 range and then scale to maxHeight
      scaledHeightData[i] = ((heightData[i] - dataMin) / dataRange) * maxHeight;
    }

    terminal.log("Scaled height data:", {
      original: { min: dataMin, max: dataMax },
      scaled: { min: Math.min(...scaledHeightData), max: Math.max(...scaledHeightData) }
    });

    // Create a platform at the center for the character to stand on
    const createPlatform = () => {
      return (
        <RigidBody type="fixed" position={[0, 250, 0]} colliders="cuboid">
          <Box
            args={[100, 5, 100]}
            receiveShadow
            castShadow
            material={new THREE.MeshStandardMaterial({ color: "#ff5500" })}
          />
        </RigidBody>
      );
    };

    return (
      <>
        <HeightfieldCollider
          args={[
            width, // number of rows
            depth, // number of columns
            scaledHeightData, // heights as a flat array
            {
              x: widthExtents / width,
              y: 1,
              z: depthExtents / depth
            } // scale per cell
          ]}
          position={[-widthExtents/2, 0, -depthExtents/2]} // Center the heightfield
          rotation={[0, 0, 0]} // No rotation needed as we extracted heights correctly
          friction={1}
          restitution={0.1}
        />
        {createPlatform()}
      </>
    );
  };

  return (
    <Group ref={terrainRef}>
      {heightData && terrainDimensions && createHeightfieldCollider()}
    </Group>
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
          <Physics gravity={[0, -20, 0]} debug={false} timeStep="vary">
            <Terrain terrainScene={terrainScene} />

            <Ecctrl
              ref={(ref) => {
                if (ref) {
                  window.characterRef = ref;
                }
              }}
              position={[0, 500, 0]}
              jumpVel={15}
              maxVelLimit={20}
              sprintMult={3}
              floatHeight={2}
              camInitDis={-15}
              camMaxDis={-50}
              camMinDis={-1}
              camFollowMult={11}
              turnSpeed={15}
              slopeMaxAngle={1}
              fallingGravityScale={5}
              fallingMaxVel={-100}
              rayLength={10}
              rayDir={{ x: 0, y: -1, z: 0 }}
              debug={true}
              autoBalance={true}
              enableDamping={true}
              enableJoystick={false}
              enableFlyMode={false}
              showDebugGui={true}
              rigidBodyType="dynamic"
            >
              <ECCtrlCharacter />
            </Ecctrl>

            {/* Add TerrainCollider to handle raycasting for terrain collision */}
            {terrainScene && window.characterRef && (
              <TerrainCollider
                terrainMesh={terrainScene.children[0]}
                characterRef={window.characterRef}
              />
            )}
          </Physics>
        )}
      </Canvas>
    </KeyboardControls>
  );
};

export default RapierScene;
