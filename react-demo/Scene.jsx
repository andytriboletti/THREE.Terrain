import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Sky, Environment, OrbitControls, Html, useKeyboardControls } from '@react-three/drei';
import { CuboidCollider, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import TerrainComponent from './TerrainComponent';
import HeightmapDebug from './HeightmapDebug';
import Instructions from './Instructions';
import Character from './Character';
import ForwardRefRigidBody from './ForwardRefRigidBody';

export default function Scene() {
  const directionalLight = useRef();
  const characterModelRef = useRef();
  const [terrainScene, setTerrainScene] = useState(null);
  const [showOrbitControls, setShowOrbitControls] = useState(false);
  const [characterPosition, setCharacterPosition] = useState([0, 300, 0]);
  const [characterVelocity, setCharacterVelocity] = useState([0, 0, 0]);
  const [cameraDistance, setCameraDistance] = useState(10); // Default camera distance
  const { scene } = useThree();

  // Get keyboard controls
  const [, getKeys] = useKeyboardControls();

  // Add a directional light that will cast shadows
  useEffect(() => {
    if (directionalLight.current) {
      directionalLight.current.shadow.mapSize.width = 2048;
      directionalLight.current.shadow.mapSize.height = 2048;
      directionalLight.current.shadow.camera.near = 0.5;
      directionalLight.current.shadow.camera.far = 500;
      directionalLight.current.shadow.camera.left = -100;
      directionalLight.current.shadow.camera.right = 100;
      directionalLight.current.shadow.camera.top = 100;
      directionalLight.current.shadow.camera.bottom = -100;
    }

    // Toggle orbit controls with 'O' key
    const handleKeyDown = (e) => {
      if (e.key === 'o' || e.key === 'O') {
        setShowOrbitControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle terrain scene when it's created
  useEffect(() => {
    if (terrainScene) {
      // Position the terrain at the origin
      terrainScene.position.set(0, 0, 0);

      // Rotate the terrain to be flat (if needed)
      terrainScene.rotation.x = -Math.PI / 2;

      // Add terrain to the scene
      scene.add(terrainScene);

      console.log("Terrain added to scene", terrainScene);

      // Clean up on unmount
      return () => {
        scene.remove(terrainScene);
      };
    }
  }, [terrainScene, scene]);

  // Toggle OrbitControls with 'O' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'o' || e.key === 'O') {
        setShowOrbitControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add mouse wheel event listener for zooming
  useEffect(() => {
    const handleWheel = (event) => {
      // Adjust zoom based on wheel direction
      setCameraDistance(prevDistance => {
        // Calculate new distance with limits
        const newDistance = prevDistance + event.deltaY * 0.01;
        return Math.max(5, Math.min(100, newDistance)); // Clamp between 5 and 100 (much farther out)
      });
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Character movement logic
  useFrame((state, delta) => {
    // Get current keyboard state
    const { forward, backward, leftward, rightward, jump, run, action1, action2 } = getKeys();

    // Handle zoom with keys 1 and 2
    if (action1) { // Zoom in with key 1
      setCameraDistance(prevDistance => Math.max(5, prevDistance - 0.5));
    }
    if (action2) { // Zoom out with key 2
      setCameraDistance(prevDistance => Math.min(100, prevDistance + 0.5));
    }

    // Calculate movement direction (fixed directions)
    let moveX = 0;
    let moveZ = 0;

    // Fix WASD directions - forward is now positive Z, backward is negative Z
    // leftward is positive X, rightward is negative X
    if (forward) moveZ += 1;  // Changed from -= to +=
    if (backward) moveZ -= 1; // Changed from += to -=
    if (leftward) moveX += 1; // Changed from -= to +=
    if (rightward) moveX -= 1; // Changed from += to -=

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

    // Get current position and velocity
    const [posX, posY, posZ] = characterPosition;
    const [velX, velY, velZ] = characterVelocity;

    // Calculate new velocity
    let newVelX = velX;
    let newVelY = velY;
    let newVelZ = velZ;

    // Apply movement impulse
    if (moveX !== 0 || moveZ !== 0) {
      const speedMultiplier = run ? 2 : 1;
      const moveSpeed = 8 * delta * 60 * speedMultiplier;

      newVelX += movingDirection.x * moveSpeed;
      newVelZ += movingDirection.z * moveSpeed;

      // Rotate character to face movement direction
      const angle = Math.atan2(movingDirection.x, movingDirection.z);
      if (characterModelRef.current) {
        characterModelRef.current.rotation.y = angle;
      }
    }

    // Handle jumping
    if (jump) {
      // Simple ground check - this is not perfect but works for demo
      if (posY < 1.1) {
        newVelY = 7; // Jump velocity
      }
    }

    // Apply gravity
    newVelY -= 9.8 * delta;

    // Apply drag to limit velocity
    newVelX *= 0.9;
    newVelZ *= 0.9;

    // Calculate new position
    const newPosX = posX + newVelX * delta;
    const newPosY = Math.max(0.5, posY + newVelY * delta); // Prevent going below ground
    const newPosZ = posZ + newVelZ * delta;

    // Update state
    setCharacterPosition([newPosX, newPosY, newPosZ]);
    setCharacterVelocity([newVelX, newVelY, newVelZ]);

    // Update camera position to follow character with dynamic distance
    state.camera.position.x = newPosX - cameraDirection.x * cameraDistance;
    state.camera.position.z = newPosZ - cameraDirection.z * cameraDistance;

    // Height scales with distance but with a curve that flattens for very large distances
    // This gives a more top-down view when zoomed far out
    const heightScale = cameraDistance <= 20
      ? cameraDistance * 0.5 // Normal scaling for close distances
      : 10 + Math.sqrt(cameraDistance - 20) * 3; // Square root scaling for far distances

    state.camera.position.y = newPosY + heightScale;
    state.camera.lookAt(newPosX, newPosY, newPosZ);
  });

  return (
    <>
      {/* Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />

      {/* Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight
        ref={directionalLight}
        position={[50, 50, 25]}
        intensity={2.0}
        castShadow
        name="followLight" // Named for ECCtrl follow light feature
      />

      {/* Optional OrbitControls for debugging - toggle with 'O' key */}
      {showOrbitControls && <OrbitControls />}

      {/* Character with direct position control */}
      <group position={characterPosition} ref={characterModelRef}>
        <Character />
      </group>

      {/* Terrain Component */}
      <TerrainComponent setTerrainScene={setTerrainScene} />

      {/* Heightmap Debug Component */}
      <HeightmapDebug />

      {/* Ground plane for safety */}
      <ForwardRefRigidBody type="fixed">
        <CuboidCollider args={[500, 0.1, 500]} position={[0, -20, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#5d8a68" />
        </mesh>
      </ForwardRefRigidBody>

      {/* Instructions UI */}
      <Instructions />
    </>
  );
}
