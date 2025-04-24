import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { terminal } from "virtual:terminal";

// A simplified version of ECCtrl that works with React 19
// This removes dependencies on leva, @react-spring/three, and zustand
const SimpleEcctrl = ({
  children,
  position = [0, 5, 0],
  rotation = [0, 0, 0],
  jumpVel = 5,
  moveSpeed = 5,
  sprintMult = 2,
  turnSpeed = 5,
  maxVelLimit = 5,
  floatHeight = 0.5,
  camInitDis = -5,
  camMaxDis = -20,
  camMinDis = -1,
  camFollowMult = 11,
  slopeMaxAngle = 1,
  debug = false,
  ...props
}) => {
  // Refs
  const rigidBodyRef = useRef();
  const characterRef = useRef();
  const colliderRef = useRef();

  // Camera settings
  const cameraDistance = useRef(camInitDis);
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());

  // Keyboard controls
  const [, getKeys] = useKeyboardControls();

  // Character state
  const [grounded, setGrounded] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [sprinting, setSprinting] = useState(false);
  const [velocity, setVelocity] = useState(new THREE.Vector3());
  const [direction, setDirection] = useState(new THREE.Vector3());

  // Get access to the Rapier world
  const { rapier, world } = useRapier();
  const { camera } = useThree();

  // Initialize character controller
  useEffect(() => {
    terminal.log("SimpleEcctrl component mounted");

    // Add mouse wheel event listener for zooming
    const handleWheel = (event) => {
      // Adjust zoom based on wheel direction (more sensitive)
      cameraDistance.current += event.deltaY * 0.01;
      // Clamp to min/max distance
      cameraDistance.current = Math.max(camMaxDis, Math.min(camMinDis, cameraDistance.current));
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [camMaxDis, camMinDis]);

  // Update character controller on each frame
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !characterRef.current) {
      return;
    }

    // Get current position
    const currentPosition = rigidBodyRef.current.translation();

    // Get keyboard input
    const { forward, backward, leftward, rightward, jump, run, action1, action2 } = getKeys();

    // Handle zoom with keys
    if (action1) {
      cameraDistance.current += 0.5;
      cameraDistance.current = Math.min(camMinDis, cameraDistance.current);
    }
    if (action2) {
      cameraDistance.current -= 0.5;
      cameraDistance.current = Math.max(camMaxDis, cameraDistance.current);
    }

    // Calculate movement direction
    const moveDirection = new THREE.Vector3();

    // Forward/backward movement (Z axis)
    if (forward) moveDirection.z -= 1;
    if (backward) moveDirection.z += 1;

    // Left/right movement (X axis)
    if (leftward) moveDirection.x -= 1;
    if (rightward) moveDirection.x += 1;

    // Normalize movement direction if moving
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }

    // Get camera rotation (only y-axis/yaw)
    const cameraRotation = new THREE.Euler(0, camera.rotation.y, 0);

    // Apply camera rotation to movement direction
    moveDirection.applyEuler(cameraRotation);

    // Set sprinting state
    setSprinting(run);

    // Apply speed
    const speed = run ? moveSpeed * sprintMult : moveSpeed;
    moveDirection.multiplyScalar(speed * delta);

    // Apply gravity
    const gravity = new THREE.Vector3(0, -9.81 * delta, 0);

    // Check if character is on the ground
    const characterPosition = new THREE.Vector3(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z
    );

    // Get terrain height at character position
    let terrainHeight = 0;
    if (window.getTerrainHeight) {
      terrainHeight = window.getTerrainHeight(characterPosition.x, characterPosition.z);
    }

    // Check if character is on the ground
    const isGrounded = characterPosition.y <= terrainHeight + floatHeight + 0.1;
    setGrounded(isGrounded);

    // Handle jumping
    if (jump && isGrounded && !jumping) {
      moveDirection.y = jumpVel * delta;
      setJumping(true);
    } else if (isGrounded) {
      setJumping(false);
    }

    // Apply gravity if not on ground
    if (!isGrounded) {
      moveDirection.add(gravity);
    }

    // Limit velocity
    if (moveDirection.length() > maxVelLimit * delta) {
      moveDirection.normalize().multiplyScalar(maxVelLimit * delta);
    }

    // Update velocity state
    setVelocity(moveDirection.clone());

    // Update direction state if moving horizontally
    if (moveDirection.x !== 0 || moveDirection.z !== 0) {
      setDirection(new THREE.Vector3(moveDirection.x, 0, moveDirection.z).normalize());
    }

    // Move character
    rigidBodyRef.current.setNextKinematicTranslation({
      x: currentPosition.x + moveDirection.x,
      y: currentPosition.y + moveDirection.y,
      z: currentPosition.z + moveDirection.z
    });

    // Rotate character to face movement direction
    if (moveDirection.x !== 0 || moveDirection.z !== 0) {
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      const currentRotation = characterRef.current.rotation.y;

      // Smoothly interpolate rotation
      characterRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        targetRotation,
        turnSpeed * delta
      );
    }

    // Update camera position
    const newPosition = rigidBodyRef.current.translation();
    cameraTarget.current.set(newPosition.x, newPosition.y + 1, newPosition.z);

    // Position camera behind character based on character's rotation
    const cameraOffset = new THREE.Vector3(0, 1.5, cameraDistance.current);
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRef.current.rotation.y);

    cameraPosition.current.set(
      newPosition.x + cameraOffset.x,
      newPosition.y + cameraOffset.y,
      newPosition.z + cameraOffset.z
    );

    // Update camera
    camera.position.copy(cameraPosition.current);
    camera.lookAt(cameraTarget.current);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      enabledRotations={[false, false, false]}
      colliders={false}
      mass={1}
      type="kinematicPosition"
      {...props}
    >
      <CapsuleCollider
        args={[0.5, 0.5]} // half height, radius
        position={[0, 1.0, 0]} // Center the collider on the character
        onColliderCreated={(collider) => {
          colliderRef.current = collider;
        }}
      />
      <group ref={characterRef}>
        {children}
      </group>
    </RigidBody>
  );
};

export default SimpleEcctrl;
