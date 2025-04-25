import React, { useState } from 'react';
import SimpleRapierScene from './SimpleRapierScene';
import TerrainComponent from './TerrainComponent';
import { terminal } from "virtual:terminal";

// Main component that loads the terrain and passes it to the scene
const RapierDemo = () => {
  const [terrainScene, setTerrainScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // When the terrain is loaded, we'll get the scene from TerrainComponent
  const handleTerrainLoaded = (scene) => {
    if (scene) {
      terminal.log("Terrain scene loaded successfully");
      setLoading(false);

      // Extract height data and dimensions from the terrain
      const terrainMesh = scene.children[0];

      // Make sure the terrain data is available globally
      window.terrainMesh = terrainMesh;
      window.terrainScene = scene;
    }
  };

  // Show loading state while terrain is being created
  if (loading) {
    return (
      <div>
        <div>Loading terrain...</div>
        {/* Render the TerrainComponent to start loading the terrain */}
        <div style={{ display: 'none' }}>
          <TerrainComponent setTerrainScene={handleTerrainLoaded} />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Render the TerrainComponent to ensure it stays loaded */}
      <div style={{ display: 'none' }}>
        <TerrainComponent setTerrainScene={setTerrainScene} />
      </div>

      {/* Pass the terrain scene to SimpleRapierScene */}
      <SimpleRapierScene terrainScene={terrainScene} />
    </>
  );
};

export default RapierDemo;
