import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import Terrain, { TerrainNS } from '../src/index.js';
import { generateBlendedMaterial } from '../src/materials.js';

export default function TerrainComponent({ setTerrainScene }) {
  const [terrainMesh, setTerrainMesh] = useState(null);
  const [heightData, setHeightData] = useState(null);
  const [terrainDimensions] = useState({
    width: 63,
    depth: 63,
    widthExtents: 1024,
    depthExtents: 1024
  });

  useEffect(() => {
    // Create terrain options with clear height differences
    const options = {
      easing: TerrainNS.EaseIn, // Ease in the terrain to create a more natural transition
      heightmap: TerrainNS.PerlinDiamond,
      maxHeight: 150, // Increased max height for more pronounced terrain features
      minHeight: -50, // Reduced min height to create a more distinct surface
      steps: 1,
      xSegments: terrainDimensions.width,
      xSize: terrainDimensions.widthExtents,
      ySegments: terrainDimensions.depth,
      ySize: terrainDimensions.depthExtents,
      // Add a custom after function to ensure the terrain has a clear top surface
      after: (vertices) => {
        // Ensure there's a minimum height for the terrain surface
        for (let i = 0; i < vertices.length; i++) {
          if (vertices[i] < 0) {
            vertices[i] = vertices[i] * 0.5; // Reduce the depth of valleys
          }
        }
      }
    };

    // Load textures for the terrain
    const textureLoader = new THREE.TextureLoader();
    const loadTextures = async () => {
      try {
        // Load textures directly from the public folder
        const textures = [
          { texture: await textureLoader.loadAsync('/img/sand1.jpg') },
          {
            texture: await textureLoader.loadAsync('/img/grass1.jpg'),
            levels: [-80, -35, 20, 50]
          },
          {
            texture: await textureLoader.loadAsync('/img/stone1.jpg'),
            levels: [20, 50, 60, 85]
          },
          {
            texture: await textureLoader.loadAsync('/img/snow1.jpg'),
            levels: [60, 85, 120, 150]
          },
        ];

        // Create blended material
        const material = generateBlendedMaterial(textures);
        options.material = material;

        // Generate terrain
        const terrainScene = Terrain(options);

        // Get the terrain mesh for collision
        const terrainMesh = terrainScene.children[0];
        terrainMesh.receiveShadow = true;
        terrainMesh.castShadow = true;

        // Extract height data for heightfield collider
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

        // Set the terrain mesh and height data
        setTerrainMesh(terrainMesh);
        setHeightData(heightfieldData);

        // Set the terrain scene for the parent component
        setTerrainScene(terrainScene);

        console.log("Terrain created with dimensions:", {
          width: width + 1,
          depth: depth + 1,
          widthExtents: terrainDimensions.widthExtents,
          depthExtents: terrainDimensions.depthExtents
        });

        console.log("Height data sample:", heightfieldData.slice(0, 10));
      } catch (error) {
        console.error("Error loading textures:", error);
        // Copy textures to the correct location or fix the path directly
        console.log("Please ensure texture files exist at the correct paths");
      }
    };

    loadTextures();
  }, [setTerrainScene, terrainDimensions]);

  // Create a heightfield collider for the terrain
  useEffect(() => {
    if (terrainMesh) {
      // Make the collision mesh visible for debugging
      const debugMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'red',
        opacity: 0.5,
        transparent: true
      });

      // Create a debug mesh to visualize the collision
      const debugMesh = new THREE.Mesh(terrainMesh.geometry.clone(), debugMaterial);
      debugMesh.position.copy(terrainMesh.position);
      debugMesh.rotation.copy(terrainMesh.rotation);
      debugMesh.scale.copy(terrainMesh.scale);

      // Add the debug mesh to the terrain mesh
      terrainMesh.add(debugMesh);

      console.log("Terrain mesh geometry:", terrainMesh.geometry);
    }
  }, [terrainMesh]);

  // Create a platform for the character to stand on
  const createPlatform = () => {
    return (
      <mesh position={[0, 150, 0]} receiveShadow>
        <boxGeometry args={[100, 5, 100]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>
    );
  };

  return (
    <>
      {/* Platform for the character to stand on */}
      {createPlatform()}
    </>
  );
}
