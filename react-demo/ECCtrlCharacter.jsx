import React from 'react';
import { Capsule, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Simple character model using a capsule - same as RapierCharacter but for ECCtrl
const ECCtrlCharacter = () => {
  return (
    <group>
      {/* Body */}
      <Capsule position={[0, 1, 0]} args={[0.5, 1, 8, 16]}>
        <meshStandardMaterial color="#4287f5" />
      </Capsule>

      {/* Head */}
      <Sphere position={[0, 2, 0]} args={[0.4, 16, 16]}>
        <meshStandardMaterial color="#f54242" />
      </Sphere>

      {/* Eyes */}
      <Sphere position={[0.2, 2.1, 0.3]} args={[0.1, 16, 16]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>

      <Sphere position={[-0.2, 2.1, 0.3]} args={[0.1, 16, 16]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
    </group>
  );
};

export default ECCtrlCharacter;
