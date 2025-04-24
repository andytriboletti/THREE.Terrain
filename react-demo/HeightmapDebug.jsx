import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Terrain, { TerrainNS } from '../src/index.js';

export default function HeightmapDebug() {
  const [heightmapData, setHeightmapData] = useState(null);
  const [terrainStats, setTerrainStats] = useState(null);
  const { scene } = useThree();

  useEffect(() => {
    // Create terrain options
    const options = {
      easing: TerrainNS.Linear,
      heightmap: TerrainNS.PerlinDiamond,
      maxHeight: 150,
      minHeight: -50,
      steps: 1,
      xSegments: 63,
      xSize: 1024,
      ySegments: 63,
      ySize: 1024,
    };

    // Generate terrain
    const terrainScene = Terrain(options);

    // Get the terrain mesh
    const terrainMesh = terrainScene.children[0];

    // Extract height data
    const geometry = terrainMesh.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const vertices = positionAttribute.array;

    // Create a 2D array to store height data
    const xSegments = options.xSegments;
    const ySegments = options.ySegments;
    const heightmap = [];

    // Calculate stats
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    let totalHeight = 0;

    // Extract height values from vertices
    for (let z = 0; z <= ySegments; z++) {
      const row = [];
      for (let x = 0; x <= xSegments; x++) {
        const index = (z * (xSegments + 1) + x) * 3;
        const height = vertices[index + 1]; // Y is up in Three.js

        // Update stats
        minHeight = Math.min(minHeight, height);
        maxHeight = Math.max(maxHeight, height);
        totalHeight += height;

        row.push(height);
      }
      heightmap.push(row);
    }

    // Calculate average height
    const avgHeight = totalHeight / ((xSegments + 1) * (ySegments + 1));

    // Count heights above 0
    let heightsAboveZero = 0;
    let heightsAbove50 = 0;
    let heightsAbove100 = 0;

    for (let z = 0; z <= ySegments; z++) {
      for (let x = 0; x <= xSegments; x++) {
        const height = heightmap[z][x];
        if (height > 0) heightsAboveZero++;
        if (height > 50) heightsAbove50++;
        if (height > 100) heightsAbove100++;
      }
    }

    // Calculate percentages
    const totalVertices = (xSegments + 1) * (ySegments + 1);
    const percentAboveZero = (heightsAboveZero / totalVertices) * 100;
    const percentAbove50 = (heightsAbove50 / totalVertices) * 100;
    const percentAbove100 = (heightsAbove100 / totalVertices) * 100;

    // Set stats
    setTerrainStats({
      minHeight,
      maxHeight,
      avgHeight,
      percentAboveZero,
      percentAbove50,
      percentAbove100,
      totalVertices
    });

    // Create a visual representation of the heightmap
    const heightmapVisual = document.createElement('canvas');
    heightmapVisual.width = xSegments + 1;
    heightmapVisual.height = ySegments + 1;
    const ctx = heightmapVisual.getContext('2d');

    // Draw heightmap
    for (let z = 0; z <= ySegments; z++) {
      for (let x = 0; x <= xSegments; x++) {
        const height = heightmap[z][x];
        // Normalize height to 0-1 range
        const normalizedHeight = (height - minHeight) / (maxHeight - minHeight);
        // Convert to grayscale color
        const color = Math.floor(normalizedHeight * 255);
        ctx.fillStyle = `rgb(${color},${color},${color})`;
        ctx.fillRect(x, z, 1, 1);
      }
    }

    // Convert canvas to data URL
    const dataURL = heightmapVisual.toDataURL();

    // Store heightmap data
    setHeightmapData({
      dataURL,
      heightmap: heightmap.slice(0, 10).map(row => row.slice(0, 10)), // Just store a small sample
      options
    });

    // Create a debug mesh to visualize the terrain
    const debugMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 'blue',
      opacity: 0.5,
      transparent: true
    });

    const debugMesh = new THREE.Mesh(geometry.clone(), debugMaterial);
    debugMesh.position.set(0, 0, 0);
    debugMesh.rotation.x = -Math.PI / 2;

    // Add debug mesh to scene
    scene.add(debugMesh);

    // Log data to console for inspection
    console.log('Terrain Heightmap Data:', {
      stats: {
        minHeight,
        maxHeight,
        avgHeight,
        percentAboveZero,
        percentAbove50,
        percentAbove100,
        totalVertices
      },
      sampleHeightmap: heightmap.slice(0, 10).map(row => row.slice(0, 10)),
      options
    });

    return () => {
      scene.remove(debugMesh);
    };
  }, [scene]);

  // Render heightmap data - use Html component from drei
  return (
    <>
      {/* Create a blue wireframe visualization of the terrain */}

      {/* Use Html component to render HTML content in 3D space */}
      <Html
        position={[0, 200, 0]}
        distanceFactor={10}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '300px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 100,
          fontFamily: 'monospace',
          fontSize: '12px',
          pointerEvents: 'none'
        }}
      >
        <div>
          <h3>Terrain Heightmap Debug</h3>

          {terrainStats && (
            <div>
              <h4>Terrain Stats</h4>
              <p>Min Height: {terrainStats.minHeight.toFixed(2)}</p>
              <p>Max Height: {terrainStats.maxHeight.toFixed(2)}</p>
              <p>Avg Height: {terrainStats.avgHeight.toFixed(2)}</p>
              <p>% Above 0: {terrainStats.percentAboveZero.toFixed(2)}%</p>
              <p>% Above 50: {terrainStats.percentAbove50.toFixed(2)}%</p>
              <p>% Above 100: {terrainStats.percentAbove100.toFixed(2)}%</p>
              <p>Total Vertices: {terrainStats.totalVertices}</p>
            </div>
          )}

          {heightmapData && (
            <div>
              <h4>Heightmap Visualization</h4>
              <img
                src={heightmapData.dataURL}
                alt="Heightmap"
                style={{
                  width: '100%',
                  imageRendering: 'pixelated',
                  border: '1px solid white'
                }}
              />

              <h4>Sample Heightmap Data (10x10)</h4>
              <div style={{ fontSize: '8px' }}>
                {heightmapData.heightmap.map((row, i) => (
                  <div key={i} style={{ whiteSpace: 'nowrap' }}>
                    {row.map((height, j) => (
                      <span key={j} style={{
                        display: 'inline-block',
                        width: '30px',
                        textAlign: 'right'
                      }}>
                        {height.toFixed(1)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Html>
    </>
  );
}
