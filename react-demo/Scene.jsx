import React, { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Sky, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import TerrainComponent from './TerrainComponent';
import HeightmapDebug from './HeightmapDebug';
import Instructions from './Instructions';
import { useRapierMode } from './RapierContext';

export default function Scene() {
  const directionalLight = useRef();
  const [terrainScene, setTerrainScene] = useState(null);
  const [showOrbitControls, setShowOrbitControls] = useState(false);
  const [heightData, setHeightData] = useState(null);
  const [terrainDimensions, setTerrainDimensions] = useState({
    width: 64,
    depth: 64,
    widthExtents: 1024,
    depthExtents: 1024
  });
  const { scene } = useThree();
  const isRapierMode = useRapierMode();

  // Add a directional light that will cast shadows
  useEffect(() => {
    if (directionalLight.current) {
      directionalLight.current.shadow.mapSize.width = 2048;
      directionalLight.current.shadow.mapSize.height = 2048;
      directionalLight.current.shadow.camera.near = 0.5;
      directionalLight.current.shadow.camera.far = 500;
      directionalLight.current.shadow.camera.left = -100;
      directionalLight.current.shadow.camera.right = 100;
      directionalLight.current.shadow.camera.top = 100;
      directionalLight.current.shadow.camera.bottom = -100;
    }

    // Toggle orbit controls with 'O' key
    const handleKeyDown = (e) => {
      if (e.key === 'o' || e.key === 'O') {
        setShowOrbitControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle terrain scene when it's created
  useEffect(() => {
    if (terrainScene) {
      // Position the terrain at the origin
      terrainScene.position.set(0, 0, 0);

      // Rotate the terrain to be flat (if needed)
      terrainScene.rotation.x = -Math.PI / 2;

      // Add terrain to the scene
      scene.add(terrainScene);

      console.log("Terrain added to scene", terrainScene);

      // Extract height data from terrain
      if (terrainScene.children && terrainScene.children[0]) {
        const terrainMesh = terrainScene.children[0];
        const geometry = terrainMesh.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const vertices = positionAttribute.array;

        // Create a heightfield array from the terrain vertices
        const width = terrainDimensions.width;
        const depth = terrainDimensions.depth;
        const heightfieldData = new Float32Array((width + 1) * (depth + 1));

        // Extract height values from vertices
        for (let i = 0; i <= depth; i++) {
          for (let j = 0; j <= width; j++) {
            const index = (i * (width + 1) + j) * 3 + 1; // Y is up in Three.js
            heightfieldData[i * (width + 1) + j] = vertices[index];
          }
        }

        // Store height data for collision detection
        setHeightData(heightfieldData);
        console.log("Terrain height data extracted", heightfieldData.slice(0, 10));
      }

      // Clean up on unmount
      return () => {
        scene.remove(terrainScene);
      };
    }
  }, [terrainScene, scene, terrainDimensions]);

  // Function to get terrain height at a specific position
  const getTerrainHeight = (x, z) => {
    if (!heightData || !terrainDimensions) return 0;

    // Convert world coordinates to terrain grid coordinates
    const halfWidth = terrainDimensions.widthExtents / 2;
    const halfDepth = terrainDimensions.depthExtents / 2;

    // Normalize coordinates to 0-1 range
    const normalizedX = (x + halfWidth) / terrainDimensions.widthExtents;
    const normalizedZ = (z + halfDepth) / terrainDimensions.depthExtents;

    // Convert to grid indices
    const gridX = Math.floor(normalizedX * terrainDimensions.width);
    const gridZ = Math.floor(normalizedZ * terrainDimensions.depth);

    // Clamp to valid range
    const clampedGridX = Math.max(0, Math.min(terrainDimensions.width, gridX));
    const clampedGridZ = Math.max(0, Math.min(terrainDimensions.depth, gridZ));

    // Get height from heightData
    const index = clampedGridZ * (terrainDimensions.width + 1) + clampedGridX;
    return heightData[index] || 0;
  };

  // Toggle OrbitControls with 'O' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'o' || e.key === 'O') {
        setShowOrbitControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  return (
    <>
      {/* Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />

      {/* Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight
        ref={directionalLight}
        position={[50, 50, 25]}
        intensity={2.0}
        castShadow
        name="followLight" // Named for ECCtrl follow light feature
      />

      {/* Optional OrbitControls for debugging - toggle with 'O' key */}
      {showOrbitControls && <OrbitControls />}

      {/* No character controller in this scene */}

      {/* Terrain Component */}
      <TerrainComponent setTerrainScene={setTerrainScene} />

      {/* Heightmap Debug Component */}
      <HeightmapDebug />

      {/* Instructions UI */}
      <Instructions />
    </>
  );
}
