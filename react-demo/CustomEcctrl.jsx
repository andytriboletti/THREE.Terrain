import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { reportError } from './ErrorReporter';

// This is a simplified version of ECCtrl that works with the latest React Three Fiber and Rapier
const CustomEcctrlInner = forwardRef((props, ref) => {
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
    camMinDis = -1,
    ...otherProps
  } = props;
  const rigidBodyRef = useRef();
  const characterRef = useRef();
  const cameraDistanceRef = useRef(camInitDis);
  const cameraTargetRef = useRef(new THREE.Vector3());
  const velocityRef = useRef(new THREE.Vector3());
  const isJumpingRef = useRef(false);
  const isSprintingRef = useRef(false);

  // Get keyboard controls
  const [, getKeys] = useKeyboardControls();

  // Get Rapier world
  const { rapier, world } = useRapier();

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    rigidBody: rigidBodyRef.current,
    character: characterRef.current,
    getVelocity: () => velocityRef.current.clone(),
    isJumping: () => isJumpingRef.current,
    isSprinting: () => isSprintingRef.current
  }));

  const { camera } = useThree();
  const mousePosition = useRef({ x: 0, y: 0 });
  const prevMousePosition = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const yawObject = useRef(new THREE.Object3D());
  const pitchObject = useRef(new THREE.Object3D());

  // Initialize camera controls
  useEffect(() => {
    try {
      // Set up mouse event listeners for camera rotation
      const handleMouseDown = (event) => {
        // Only set isMouseDown to true for left mouse button (button 0)
        if (event.button === 0) {
          isMouseDown.current = true;

          // Store initial mouse position on mouse down
          mousePosition.current.x = event.clientX;
          mousePosition.current.y = event.clientY;
          prevMousePosition.current.x = event.clientX;
          prevMousePosition.current.y = event.clientY;

          // Capture pointer to keep receiving mouse events even when cursor leaves the window
          try {
            document.body.requestPointerLock();
          } catch (e) {
            reportError(e, { source: 'requestPointerLock' });
            console.error('Failed to request pointer lock:', e);
          }
        }
      };

      const handleMouseUp = (event) => {
        // Only handle left mouse button (button 0)
        if (event.button === 0) {
          isMouseDown.current = false;

          // Release pointer lock
          try {
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }
          } catch (e) {
            reportError(e, { source: 'exitPointerLock' });
            console.error('Failed to exit pointer lock:', e);
          }
        }
      };

      const handleMouseMove = (event) => {
        // Use movementX and movementY for better mouse control
        // These values work even when the pointer is locked
        if (document.pointerLockElement) {
          mousePosition.current.x += event.movementX || 0;
          mousePosition.current.y += event.movementY || 0;
        }
      };

      // Add event listeners
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      // Initialize yaw and pitch objects
      yawObject.current.add(pitchObject.current);

      console.info('[VITE-TERMINAL-INFO] Camera controls initialized successfully');

      // Clean up event listeners
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);

        // Make sure to exit pointer lock when component unmounts
        if (document.pointerLockElement) {
          try {
            document.exitPointerLock();
          } catch (e) {
            console.error('[VITE-TERMINAL-ERROR] Failed to exit pointer lock during cleanup:', e);
          }
        }
      };
    } catch (error) {
      reportError(error, { source: 'CustomEcctrl useEffect' });
      console.error('[VITE-TERMINAL-ERROR] Failed to initialize camera controls:', error);
    }
  }, []);

  // Track if the component is mounted
  const isMounted = useRef(false);

  // Set up a timeout to initialize the rigid body
  useEffect(() => {
    isMounted.current = true;

    // Log that the component is mounted
    console.info("CustomEcctrl component mounted");

    // Clean up
    return () => {
      isMounted.current = false;
      console.info("CustomEcctrl component unmounted");
    };
  }, []);

  // Handle character movement and camera
  useFrame((state, delta) => {
    try {
      // Skip frames until the rigid body is available
      if (!rigidBodyRef.current || !isMounted.current) {
        // Only log this warning occasionally to reduce spam
        if (Math.random() < 0.005) {
          console.warn("rigidBodyRef is not available yet or component not mounted");
        }
        return;
      }

      // Log that the rigid body is available (only once)
      if (!rigidBodyRef.current._loggedAvailable) {
        console.info("rigidBodyRef is now available!");
        rigidBodyRef.current._loggedAvailable = true;
      }

      const { forward, backward, leftward, rightward, jump, run } = getKeys();

      // Get current velocity
      const velocity = rigidBodyRef.current.linvel();
      velocityRef.current.set(velocity.x, velocity.y, velocity.z);

      // Handle camera rotation with mouse
      if (document.pointerLockElement) {
        const movementX = mousePosition.current.x - prevMousePosition.current.x;
        const movementY = mousePosition.current.y - prevMousePosition.current.y;

        // Rotate yaw (left/right)
        yawObject.current.rotation.y -= movementX * 0.002;

        // Rotate pitch (up/down) with limits
        pitchObject.current.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, pitchObject.current.rotation.x - movementY * 0.002)
        );
      }

      // Update previous mouse position
      prevMousePosition.current.x = mousePosition.current.x;
      prevMousePosition.current.y = mousePosition.current.y;

      // Calculate movement direction based on camera orientation
      const cameraDirection = new THREE.Vector3(0, 0, -1);
      cameraDirection.applyQuaternion(yawObject.current.quaternion);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const cameraRight = new THREE.Vector3(1, 0, 0);
      cameraRight.applyQuaternion(yawObject.current.quaternion);
      cameraRight.y = 0;
      cameraRight.normalize();

      // Calculate movement vector
      const movementVector = new THREE.Vector3(0, 0, 0);

      if (forward) movementVector.add(cameraDirection);
      if (backward) movementVector.sub(cameraDirection);
      if (leftward) movementVector.sub(cameraRight);
      if (rightward) movementVector.add(cameraRight);

      movementVector.normalize();

      // Apply sprint multiplier
      isSprintingRef.current = run;
      const currentMaxVel = run ? maxVelLimit * sprintMult : maxVelLimit;

      // Apply movement force
      if (movementVector.length() > 0) {
        rigidBodyRef.current.applyImpulse({
          x: movementVector.x * currentMaxVel * delta * 60,
          y: 0,
          z: movementVector.z * currentMaxVel * delta * 60
        }, true);
      }

      // Apply friction to slow down
      if (movementVector.length() === 0 && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1)) {
        rigidBodyRef.current.applyImpulse({
          x: -velocity.x * 0.2,
          y: 0,
          z: -velocity.z * 0.2
        }, true);
      }

      // Handle jumping
      if (jump && !isJumpingRef.current) {
        isJumpingRef.current = true;
        rigidBodyRef.current.applyImpulse({ x: 0, y: jumpVel, z: 0 }, true);
      }

      // Check if character is on ground
      const origin = rigidBodyRef.current.translation();
      const rayDir = { x: 0, y: -1, z: 0 };
      const rayLength = floatHeight + 0.1;

      const ray = new rapier.Ray(origin, rayDir);
      const hit = world.castRay(ray, rayLength, true);

      if (hit && hit.toi < rayLength) {
        isJumpingRef.current = false;
      }

      // Update character rotation to face movement direction
      if (movementVector.length() > 0 && characterRef.current) {
        const targetRotation = Math.atan2(movementVector.x, movementVector.z);
        characterRef.current.rotation.y = THREE.MathUtils.lerp(
          characterRef.current.rotation.y,
          targetRotation,
          delta * 10
        );
      }

      // Update camera position
      if (rigidBodyRef.current) {
        const pos = rigidBodyRef.current.translation();

        // Update camera target position (character position)
        const targetPosition = new THREE.Vector3(pos.x, pos.y + 1.5, pos.z);

        // Handle camera zoom with mouse wheel
        cameraDistanceRef.current = THREE.MathUtils.clamp(
          cameraDistanceRef.current + (state.mouse.wheel[1] * 0.5),
          camMaxDis,
          camMinDis
        );

        // Calculate camera position based on yaw and pitch
        const cameraOffset = new THREE.Vector3(0, 0, cameraDistanceRef.current);
        cameraOffset.applyQuaternion(yawObject.current.quaternion);

        // Position camera
        camera.position.copy(targetPosition).add(cameraOffset);
        camera.lookAt(targetPosition);

        // Log camera position for debugging
        if (Math.random() < 0.01) { // Only log occasionally to avoid spam
          console.debug('[VITE-TERMINAL-DEBUG] Camera position:',
            JSON.stringify({
              x: camera.position.x.toFixed(2),
              y: camera.position.y.toFixed(2),
              z: camera.position.z.toFixed(2),
              lookingAt: {
                x: targetPosition.x.toFixed(2),
                y: targetPosition.y.toFixed(2),
                z: targetPosition.z.toFixed(2)
              },
              isMouseDown: isMouseDown.current
            })
          );
        }
      }
    } catch (error) {
      reportError(error, { source: 'CustomEcctrl useFrame' });
      console.error('[VITE-TERMINAL-ERROR] Error in CustomEcctrl useFrame:', error);
    }
  });

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    // Method to get the current position
    getPosition: () => {
      if (rigidBodyRef.current) {
        const position = rigidBodyRef.current.translation();
        return new Vector3(position.x, position.y, position.z);
      }
      return new Vector3();
    },

    // Method to set the position
    setPosition: (x, y, z) => {
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x, y, z }, true);
      }
    },

    // Method to get the character object
    getCharacterObject: () => characterRef.current,

    // Method to get the rigid body
    getRigidBody: () => rigidBodyRef.current
  }), []);

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
export const CustomEcctrl = forwardRef((props, ref) => {
  return <CustomEcctrlInner {...props} ref={ref} />;
});
