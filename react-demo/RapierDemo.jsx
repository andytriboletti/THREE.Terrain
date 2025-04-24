import React, { useEffect, useState } from 'react';
import RapierScene from './RapierScene';
import { terminal } from "virtual:terminal";

// Main component that loads the terrain and passes it to the scene
const RapierDemo = () => {
  const [terrainScene, setTerrainScene] = useState(null);
  const [heightData, setHeightData] = useState(null);
  const [terrainDimensions, setTerrainDimensions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to load the terrain
    const loadTerrain = async () => {
      try {
        setLoading(true);

        // Create a simple terrain
        const THREE = await import('three');

        // Create a plane geometry for the terrain
        const geometry = new THREE.PlaneGeometry(1024, 1024, 63, 63);

        // Create a material for the terrain
        const material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          flatShading: true
        });

        // Create the terrain mesh
        const terrainMesh = new THREE.Mesh(geometry, material);

        // Rotate the terrain to be horizontal
        terrainMesh.rotation.x = -Math.PI / 2;

        // Generate height data
        const heightData = [];
        const size = 64;

        for (let i = 0; i < size; i++) {
          const row = [];
          for (let j = 0; j < size; j++) {
            // Generate a simple height value
            const height = Math.sin(i / 10) * Math.cos(j / 10) * 50 + 100;
            row.push(height);

            // Apply the height to the terrain vertices
            const vertexIndex = i * size + j;
            if (geometry.attributes.position.array[vertexIndex * 3 + 2] !== undefined) {
              geometry.attributes.position.array[vertexIndex * 3 + 2] = height;
            }
          }
          heightData.push(row);
        }

        // Update the geometry
        geometry.computeVertexNormals();
        geometry.attributes.position.needsUpdate = true;

        // Create terrain dimensions
        const terrainDimensions = {
          width: size,
          depth: size,
          widthExtents: 1024,
          depthExtents: 1024,
          maxHeight: 150
        };

        // Store the terrain data
        setTerrainScene(terrainMesh);
        setHeightData(heightData);
        setTerrainDimensions(terrainDimensions);

        // Also store in window for future use
        window.terrainMesh = terrainMesh;
        window.heightData = heightData;
        window.terrainDimensions = terrainDimensions;

        setLoading(false);
      } catch (err) {
        terminal.error("Error loading terrain:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadTerrain();
  }, []);

  if (loading) {
    return <div>Loading terrain...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <RapierScene
      terrainScene={terrainScene}
      heightData={heightData}
      terrainDimensions={terrainDimensions}
    />
  );
};

export default RapierDemo;
