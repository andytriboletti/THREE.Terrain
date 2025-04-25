import React, { useMemo } from 'react';
import { useGLTF, Capsule, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Simple character model using a capsule
const RapierCharacter = () => {
  // Create materials
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#4287f5"
  }), []);

  const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f54242"
  }), []);

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000000"
  }), []);

  return (
    <group>
      {/* Body */}
      <Capsule
        position={[0, 1, 0]}
        args={[0.5, 1, 8, 16]}
        material={bodyMaterial}
      />

      {/* Head */}
      <Sphere
        position={[0, 2, 0]}
        args={[0.4, 16, 16]}
        material={headMaterial}
      />

      {/* Eyes */}
      <Sphere
        position={[0.2, 2.1, 0.3]}
        args={[0.1, 16, 16]}
        material={eyeMaterial}
      />

      <Sphere
        position={[-0.2, 2.1, 0.3]}
        args={[0.1, 16, 16]}
        material={eyeMaterial}
      />
    </group>
  );
};

export default RapierCharacter;
