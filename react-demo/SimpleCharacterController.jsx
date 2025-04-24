import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

// A very simple character controller that works with React Three Fiber and Rapier
export default function SimpleCharacterController({
  children,
  position = [0, 5, 0],
  jumpVel = 5,
  moveSpeed = 5,
  ...props
}) {
  const rigidBodyRef = useRef();
  const characterRef = useRef();

  // Get keyboard controls
  const [, getKeys] = useKeyboardControls();

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
        x: movingDirection.x * moveSpeed * delta * 60,
        y: 0,
        z: movingDirection.z * moveSpeed * delta * 60
      }, true);

      // Rotate character to face movement direction
      const angle = Math.atan2(movingDirection.x, movingDirection.z);
      characterRef.current.rotation.y = angle;
    }

    // Handle jumping
    if (jump) {
      // Simple ground check - this is not perfect but works for demo
      const position = rigidBodyRef.current.translation();
      if (position.y < 1.1) {
        rigidBodyRef.current.applyImpulse({ x: 0, y: jumpVel, z: 0 }, true);
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
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      enabledRotations={[false, false, false]}
      colliders={false}
      mass={1}
      type="dynamic"
      {...props}
    >
      <CapsuleCollider
        args={[0.5, 0.5]} // half height, radius
        position={[0, 1.0, 0]} // Center the collider on the character
      />
      <group ref={characterRef}>
        {children}
      </group>
    </RigidBody>
  );
}
