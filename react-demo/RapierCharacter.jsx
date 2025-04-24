import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Simple character model using a capsule
const RapierCharacter = () => {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#4287f5" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#f54242" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.2, 2.1, 0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <mesh position={[-0.2, 2.1, 0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export default RapierCharacter;
