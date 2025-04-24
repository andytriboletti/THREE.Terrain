import React, { useEffect, useState } from 'react';
import { HeightfieldCollider as RapierHeightfieldCollider, RigidBody } from '@react-three/rapier';

export default function TerrainHeightfieldCollider({ heightData, terrainDimensions }) {
  const [colliderArgs, setColliderArgs] = useState(null);

  useEffect(() => {
    if (heightData && terrainDimensions) {
      // Prepare collider arguments
      setColliderArgs([
        terrainDimensions.width, // number of rows
        terrainDimensions.depth, // number of columns
        heightData, // height data array
        {
          x: terrainDimensions.widthExtents,
          y: 1, // Scale factor for height (keep at 1 to match terrain)
          z: terrainDimensions.depthExtents
        } // size
      ]);
    }
  }, [heightData, terrainDimensions]);

  if (!colliderArgs) return null;

  return (
    <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
      <RapierHeightfieldCollider
        args={colliderArgs}
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to match terrain orientation
        friction={1.0}
        restitution={0.2}
      />
    </RigidBody>
  );
}
