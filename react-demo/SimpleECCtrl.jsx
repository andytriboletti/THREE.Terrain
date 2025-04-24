import React, { useRef, useEffect, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { reportError } from './ErrorReporter';

// This is a simplified version of ECCtrl that works with the latest React Three Fiber and Rapier
const SimpleECCtrlInner = forwardRef((props, ref) => {
  // Extract props with defaults
  const {
    children,
    position = [0, 5, 0],
    rotation = [0, 0, 0],
    jumpVel = 5,
    maxVelLimit = 5,
    sprintMult = 2,
    floatHeight = 0.5,
    camInitDis = -5,
    camMaxDis = -20,
    camMinDis = -5,
    ...otherProps
  } = props;

  // Create internal refs
  const rigidBodyRef = useRef();
  const characterRef = useRef();
  const { rapier, world } = useRapier();

  // Forward the rigidBodyRef to the parent component
  React.useImperativeHandle(ref, () => rigidBodyRef.current);

  // Keyboard controls
  const [, getKeys] = useKeyboardControls();

  // Character state
  const canJump = useRef(true);
  const currentVel = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const moveImpulse = useRef(new THREE.Vector3());
  const movingDirection = useRef(new THREE.Vector3());

  // Track if the component is mounted
  const isMounted = useRef(false);

  // Set up a timeout to initialize the rigid body
  useEffect(() => {
    isMounted.current = true;
    console.info("SimpleECCtrl component mounted");

    // Clean up
    return () => {
      isMounted.current = false;
      console.info("SimpleECCtrl component unmounted");
    };
  }, []);

  // Character movement logic
  useFrame((state, delta) => {
    // Skip frames until the rigid body is available
    if (!rigidBodyRef.current || !isMounted.current) {
      // Only log this warning occasionally to reduce spam
      if (Math.random() < 0.005) {
        console.warn("rigidBodyRef is not available yet or component not mounted");
      }
      return;
    }

    // Get current keyboard state
    const { forward, backward, leftward, rightward, jump, run } = getKeys();

    // Get current position and velocity
    const position = rigidBodyRef.current.translation();
    currentPos.current.set(position.x, position.y, position.z);

    const linvel = rigidBodyRef.current.linvel();
    currentVel.current.set(linvel.x, linvel.y, linvel.z);

    // Handle jumping
    if (jump && canJump.current) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: jumpVel, z: 0 }, true);
      canJump.current = false;
    }

    // Reset jump when on ground
    if (position.y <= floatHeight + 0.1 && !jump) {
      canJump.current = true;
    }

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

    // Apply movement impulse
    const speedMultiplier = run ? sprintMult : 1;
    const moveSpeed = maxVelLimit * speedMultiplier;

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

    movingDirection.current.set(
      cameraRight.x * moveX + cameraDirection.x * moveZ,
      0,
      cameraRight.z * moveX + cameraDirection.z * moveZ
    );

    // Apply movement impulse
    if (moveX !== 0 || moveZ !== 0) {
      moveImpulse.current.set(
        movingDirection.current.x * moveSpeed,
        0,
        movingDirection.current.z * moveSpeed
      );

      rigidBodyRef.current.applyImpulse(moveImpulse.current, true);
    }

    // Apply drag to limit velocity
    if (position.y <= floatHeight + 0.5) {
      const dragForce = new THREE.Vector3(
        -currentVel.current.x * 0.5,
        0,
        -currentVel.current.z * 0.5
      );
      rigidBodyRef.current.applyImpulse(dragForce, true);
    }

    // Rotate character to face movement direction
    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(movingDirection.current.x, movingDirection.current.z);
      characterRef.current.rotation.y = angle;
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      enabledRotations={[false, false, false]}
      colliders={false}
      mass={1}
      type="dynamic"
      {...otherProps}
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
});

// Export the component with forwardRef
export default forwardRef((props, ref) => {
  return <SimpleECCtrlInner {...props} ref={ref} />;
});
