import React, { useRef, forwardRef, useMemo } from 'react';
import { Box, Sphere, Capsule } from '@react-three/drei';
import * as THREE from 'three';

const Character = forwardRef(function Character(_, ref) {
  const characterRef = useRef();

  // Connect the forwarded ref to the character ref
  React.useImperativeHandle(ref, () => ({
    getObject3D: () => characterRef.current
  }));

  // Simple character model - a colored capsule with eyes
  // We can add animations or effects here if needed
  // useFrame((_state, _delta) => {
  //   if (characterRef.current) {
  //     // Add character animations or effects
  //   }
  // });

  // Create materials
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ff5500",
    emissive: "#ff2200",
    emissiveIntensity: 0.3
  }), []);

  const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "white"
  }), []);

  const eyeBlackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "black"
  }), []);

  return (
    <group ref={characterRef}>
      {/* Body */}
      <Capsule args={[0.3, 1, 16, 16]} castShadow material={bodyMaterial} />

      {/* Head */}
      <Sphere position={[0, 0.8, 0]} args={[0.25, 32, 32]} castShadow material={bodyMaterial} />

      {/* Eyes */}
      <Sphere position={[0.1, 0.85, 0.18]} args={[0.05, 16, 16]} castShadow material={eyeWhiteMaterial} />
      <Sphere position={[-0.1, 0.85, 0.18]} args={[0.05, 16, 16]} castShadow material={eyeWhiteMaterial} />
      <Sphere position={[0.1, 0.85, 0.23]} args={[0.025, 16, 16]} castShadow material={eyeBlackMaterial} />
      <Sphere position={[-0.1, 0.85, 0.23]} args={[0.025, 16, 16]} castShadow material={eyeBlackMaterial} />

      {/* Arms */}
      <Capsule
        position={[0.4, 0.2, 0]}
        rotation={[0, 0, -Math.PI / 6]}
        args={[0.08, 0.5, 16, 16]}
        castShadow
        material={bodyMaterial}
      />
      <Capsule
        position={[-0.4, 0.2, 0]}
        rotation={[0, 0, Math.PI / 6]}
        args={[0.08, 0.5, 16, 16]}
        castShadow
        material={bodyMaterial}
      />

      {/* Legs */}
      <Capsule
        position={[0.15, -0.6, 0]}
        args={[0.1, 0.5, 16, 16]}
        castShadow
        material={bodyMaterial}
      />
      <Capsule
        position={[-0.15, -0.6, 0]}
        args={[0.1, 0.5, 16, 16]}
        castShadow
        material={bodyMaterial}
      />
    </group>
  );
});

/*
  Note: You can replace this with a more complex character model using:

  import { useGLTF } from '@react-three/drei';

  // Load a GLTF model
  const { nodes, materials } = useGLTF('/path/to/character.glb');

  return (
    <group ref={characterRef}>
      <primitive object={nodes.Character} />
    </group>
  );
*/

export default Character;
