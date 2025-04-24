import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import Character from './Character';

export default function CharacterController({ position = [0, 5, 0] }) {
  const characterRef = useRef();
  const { rapier, world } = useRapier();
  const [, getKeys] = useKeyboardControls();
  
  // Create rigid body directly using Rapier
  const rigidBodyRef = useRef();
  
  useEffect(() => {
    // Create rigid body
    const rigidBodyDesc = new rapier.RigidBodyDesc(rapier.RigidBodyType.Dynamic)
      .setTranslation(...position)
      .setLinearDamping(0.5)
      .setAngularDamping(0.5);
    
    const rigidBody = world.createRigidBody(rigidBodyDesc);
    
    // Create collider
    const colliderDesc = new rapier.ColliderDesc(
      new rapier.Capsule(0.5, 0.5) // half height, radius
    )
      .setTranslation(0, 1.0, 0); // Center the collider on the character
    
    world.createCollider(colliderDesc, rigidBody);
    
    // Store reference
    rigidBodyRef.current = rigidBody;
    
    // Cleanup
    return () => {
      world.removeRigidBody(rigidBody);
    };
  }, [rapier, world, position]);
  
  // Character movement logic
  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;
    
    // Get current keyboard state
    const { forward, backward, leftward, rightward, jump } = getKeys();
    
    // Calculate movement direction
    let moveX = 0;
    let moveZ = 0;
    
    if (forward) moveZ -= 1;
    if (backward) moveZ += 1;
    if (leftward) moveX -= 1;
    if (rightward) moveX += 1;
    
    // Normalize movement vector
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
    }
    
    // Apply movement in the direction the camera is facing
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Calculate movement direction relative to camera
    const cameraRight = new THREE.Vector3(
      cameraDirection.z,
      0,
      -cameraDirection.x
    );
    
    const movingDirection = new THREE.Vector3(
      cameraRight.x * moveX + cameraDirection.x * moveZ,
      0,
      cameraRight.z * moveX + cameraDirection.z * moveZ
    );
    
    // Apply movement impulse
    if (moveX !== 0 || moveZ !== 0) {
      rigidBodyRef.current.applyImpulse({
        x: movingDirection.x * 8 * delta * 60,
        y: 0,
        z: movingDirection.z * 8 * delta * 60
      }, true);
      
      // Rotate character to face movement direction
      if (characterRef.current) {
        const angle = Math.atan2(movingDirection.x, movingDirection.z);
        characterRef.current.rotation.y = angle;
      }
    }
    
    // Handle jumping
    if (jump) {
      // Simple ground check - this is not perfect but works for demo
      const position = rigidBodyRef.current.translation();
      if (position.y < 1.1) {
        rigidBodyRef.current.applyImpulse({ x: 0, y: 7, z: 0 }, true);
      }
    }
    
    // Apply drag to limit velocity
    const linvel = rigidBodyRef.current.linvel();
    if (Math.abs(linvel.x) > 0.1 || Math.abs(linvel.z) > 0.1) {
      rigidBodyRef.current.applyImpulse({
        x: -linvel.x * 0.2,
        y: 0,
        z: -linvel.z * 0.2
      }, true);
    }
    
    // Update character position
    if (characterRef.current && rigidBodyRef.current) {
      const position = rigidBodyRef.current.translation();
      characterRef.current.position.set(position.x, position.y - 1.0, position.z);
    }
  });

  return (
    <group ref={characterRef}>
      <Character />
    </group>
  );
}
