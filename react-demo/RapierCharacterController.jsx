import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { CapsuleCollider, useRapier } from '@react-three/rapier';
import CustomRigidBody from './CustomRigidBody';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { terminal } from "virtual:terminal";

// Character controller based on Rapier's KinematicCharacterController
const RapierCharacterController = forwardRef(({
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
  ...otherProps
}, ref) => {
  // Refs
  const rigidBodyRef = useRef();
  const characterRef = useRef();
  const colliderRef = useRef();
  const controller = useRef(null);
  const isMounted = useRef(false);

  // Camera settings
  const cameraDistance = useRef(camInitDis);
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());

  // Forward the rigidBodyRef to the parent component
  useImperativeHandle(ref, () => rigidBodyRef.current, [rigidBodyRef.current]);

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
    isMounted.current = true;
    terminal.log("RapierCharacterController component mounted");

    // Initialize character controller if Rapier is available
    try {
      if (rapier && world) {
        // In React Three Rapier, the world object is different from raw Rapier
        // We need to access the raw world differently
        let rawWorld;

        // Try different ways to access the raw world
        if (typeof world.raw === 'function') {
          rawWorld = world.raw();
        } else if (world._raw) {
          rawWorld = world._raw;
        } else {
          // Direct access if it's already the raw world
          rawWorld = world;
        }

        terminal.log("Got raw world:", rawWorld);

        // Try different ways to create the character controller
        try {
          // First try with the new API (object parameter)
          const characterController = rawWorld.createCharacterController({
            offset: 0.1,
            applyImpulsesToDynamicBodies: true,
            characterMass: 1.0,
            enableSnapToGround: true,
            snapToGroundDistance: 0.1
          });
          controller.current = characterController;
          terminal.log("Character controller initialized with new API");
        } catch (innerError) {
          terminal.log("New API failed:", innerError);
          try {
            // Fall back to the old API
            terminal.log("Falling back to old character controller API");
            const characterController = rawWorld.createCharacterController(0.1);
            characterController.setApplyImpulsesToDynamicBodies(true);
            characterController.setCharacterMass(1.0);
            characterController.enableSnapToGround(0.1);
            controller.current = characterController;
            terminal.log("Character controller initialized with old API");
          } catch (oldApiError) {
            terminal.error("Old API failed too:", oldApiError);
            // If both APIs fail, we'll just use basic movement
            terminal.log("Using basic movement without character controller");
          }
        }
      }
    } catch (error) {
      terminal.error("Failed to initialize character controller", error);
      console.error("Character controller error:", error);
    }

    // Add mouse wheel event listener for zooming
    const handleWheel = (event) => {
      // Adjust zoom based on wheel direction (more sensitive)
      cameraDistance.current += event.deltaY * 0.01;
      // Clamp to min/max distance
      cameraDistance.current = Math.max(camMaxDis, Math.min(camMinDis, cameraDistance.current));
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      isMounted.current = false;
      window.removeEventListener('wheel', handleWheel);
    };
  }, [rapier, world, camMaxDis, camMinDis]);

  // Update character controller on each frame
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !characterRef.current || !controller.current) {
      // Skip silently if not ready
      return;
    }

    // Get current position
    const currentPosition = rigidBodyRef.current.translation();

    // Get keyboard input
    const { forward, backward, left, right, jump, sprint, zoom_in, zoom_out } = getKeys();

    // Handle zoom with keys
    if (zoom_in) {
      cameraDistance.current += 0.5;
      cameraDistance.current = Math.min(camMinDis, cameraDistance.current);
    }
    if (zoom_out) {
      cameraDistance.current -= 0.5;
      cameraDistance.current = Math.max(camMaxDis, cameraDistance.current);
    }

    // Calculate movement direction
    const moveDirection = new THREE.Vector3();

    // Forward/backward movement (Z axis)
    if (forward) moveDirection.z -= 1;
    if (backward) moveDirection.z += 1;

    // Left/right movement (X axis)
    if (left) moveDirection.x -= 1;
    if (right) moveDirection.x += 1;

    // Normalize movement direction if moving
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }

    // Get camera rotation (only y-axis/yaw)
    const cameraRotation = new THREE.Euler(0, camera.rotation.y, 0);

    // Apply camera rotation to movement direction
    moveDirection.applyEuler(cameraRotation);

    // Set sprinting state
    setSprinting(sprint);

    // Apply speed
    const speed = sprint ? moveSpeed * sprintMult : moveSpeed;
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

    // Move character using Rapier's character controller
    if (controller.current && colliderRef.current) {
      const characterController = controller.current;

      try {
        // Create a Rapier vector for the movement
        const rapierVec = new rapier.Vector3(moveDirection.x, moveDirection.y, moveDirection.z);

        // Get the raw collider
        let rawCollider;
        if (colliderRef.current) {
          if (typeof colliderRef.current.raw === 'function') {
            rawCollider = colliderRef.current.raw();
          } else if (colliderRef.current._raw) {
            rawCollider = colliderRef.current._raw;
          } else {
            // Direct access if it's already the raw collider
            rawCollider = colliderRef.current;
          }
        } else {
          terminal.error("No collider reference available");
          return; // Skip the rest of the movement logic
        }

        // Apply the movement - handle potential API differences
        try {
          // Try the new API first
          characterController.computeColliderMovement(
            rawCollider,
            rapierVec
          );
        } catch (apiError) {
          // Fall back to alternative API if needed
          terminal.log("Falling back to alternative movement API");
          try {
            // Try with different parameter order
            characterController.computeColliderMovement(
              rapierVec,
              rawCollider
            );
          } catch (fallbackError) {
            terminal.error("All movement API attempts failed", fallbackError);
            return; // Skip the rest of the movement logic
          }
        }

        // Get the effective movement
        let effectiveMovement;
        try {
          effectiveMovement = characterController.computedMovement();
        } catch (movementError) {
          terminal.error("Failed to get computed movement", movementError);
          return; // Skip the rest of the movement logic
        }

        // Apply the movement to the rigid body
        rigidBodyRef.current.setNextKinematicTranslation({
          x: currentPosition.x + effectiveMovement.x,
          y: currentPosition.y + effectiveMovement.y,
          z: currentPosition.z + effectiveMovement.z
        });

        // Check if character is grounded after movement
        try {
          setGrounded(characterController.computedGrounded());
        } catch (groundedError) {
          // If computedGrounded() fails, use our own grounding check
          terminal.log("Using fallback grounding check");
          // We already have isGrounded from earlier in the code
          setGrounded(isGrounded);
        }
      } catch (error) {
        terminal.error("Error in character controller:", error);
        console.error("Character movement error:", error);
      }

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
    <CustomRigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      enabledRotations={[false, false, false]}
      colliders={false}
      mass={1}
      type="kinematicPosition"
      {...otherProps}
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
    </CustomRigidBody>
  );
});

export default RapierCharacterController;
