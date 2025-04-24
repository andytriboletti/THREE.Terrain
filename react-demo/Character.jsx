import React, { useRef, forwardRef } from 'react';

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

  return (
    <group ref={characterRef}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 1, 16, 16]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.1, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.1, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.1, 0.85, 0.23]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.1, 0.85, 0.23]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Arms */}
      <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 16, 16]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 16, 16]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.15, -0.6, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 16, 16]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.15, -0.6, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 16, 16]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>
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
